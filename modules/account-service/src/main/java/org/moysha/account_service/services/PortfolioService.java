package org.moysha.account_service.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.moysha.account_service.dto.AccountSummaryResp;
import org.moysha.account_service.dto.PositionResp;
import org.moysha.account_service.dto.TradeExecutedEvent;
import org.moysha.account_service.dto.TradeRequest;
import org.moysha.account_service.exceptions.MessageException;
import org.moysha.account_service.models.BrokerageAccount;
import org.moysha.account_service.models.BrokeragePosition;
import org.moysha.account_service.models.Stock;
import org.moysha.account_service.models.User;
import org.moysha.account_service.repositories.BrokerageAccountRepository;
import org.moysha.account_service.repositories.BrokeragePositionRepository;
import org.moysha.account_service.repositories.StockPricesRepository;
import org.moysha.account_service.repositories.StockRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final BrokerageAccountRepository brokerageAccountRepository;
    private final BrokeragePositionRepository brokeragePositionRepository;
    private final StockRepository stockRepository;
    private final StockPricesRepository stockPricesRepository;
    private final UserService userService;
    private final TradeEventPublisher tradeEventPublisher;

    private void publishTrade(User user, Stock stock, String side, BigDecimal qty, BigDecimal price) {
        long priceInCents = price.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).longValueExact();
        tradeEventPublisher.publish(new TradeExecutedEvent(
                UUID.randomUUID().toString(),
                String.valueOf(user.getId()),
                stock.getTicker(),
                side,
                qty.intValue(),
                priceInCents,
                System.currentTimeMillis()
        ));
    }

    private BrokerageAccount getOrCreateAccount(User user) {
        return brokerageAccountRepository.findByUser(user)
                .orElseGet(() -> brokerageAccountRepository.save(
                        BrokerageAccount.builder()
                                .user(user)
                                .balance(BigDecimal.valueOf(1000))
                                .createdAt(LocalDateTime.now())
                                .build()
                ));
    }

    private Stock requireStock(String ticker) {
        Stock stock = stockRepository.findByTicker(ticker.toUpperCase());
        if (stock == null) {
            throw new MessageException("Акция " + ticker + " не найдена");
        }
        return stock;
    }

    private BigDecimal getLatestPrice(Stock stock) {
        var prices = stockPricesRepository.findLatestPrice(stock.getId());
        if (prices.isEmpty()) {
            throw new MessageException("Для акции " + stock.getTicker() + " нет цены");
        }
        return BigDecimal.valueOf(prices.get(0).getPrice());
    }

    private List<PositionResp> mapPositions(BrokerageAccount account) {
        return brokeragePositionRepository.findAllByAccount(account)
                .stream()
                .map(p -> {
                    BigDecimal currentPrice = getLatestPrice(p.getStock());
            BigDecimal marketValue = currentPrice.multiply(p.getQuantity()).setScale(4, RoundingMode.HALF_UP);
            return new PositionResp(
                    p.getStock().getTicker(),
                    p.getStock().getName(),
                    p.getStock().getLogo(),
                    p.getQuantity(),
                    p.getAveragePrice(),
                    currentPrice,
                    marketValue
            );
                })
                .toList();
    }

    public AccountSummaryResp getAccountSummary() {
        User user = userService.getCurrentUser();
        BrokerageAccount account = getOrCreateAccount(user);
        return new AccountSummaryResp(account.getBalance(), mapPositions(account));
    }

    @Transactional
    public AccountSummaryResp buy(TradeRequest request) {
        if (request.getQuantity() <= 0) {
            throw new MessageException("Количество должно быть больше нуля");
        }

        User user = userService.getCurrentUser();
        BrokerageAccount account = getOrCreateAccount(user);
        Stock stock = requireStock(request.getTicker());
        BigDecimal price = getLatestPrice(stock);
        BigDecimal qty = BigDecimal.valueOf(request.getQuantity());
        BigDecimal cost = price.multiply(qty).setScale(4, RoundingMode.HALF_UP);

        if (account.getBalance().compareTo(cost) < 0) {
            throw new MessageException("Недостаточно средств");
        }

        var positionOpt = brokeragePositionRepository.findByAccountAndStock(account, stock);
        LocalDateTime now = LocalDateTime.now();

        if (positionOpt.isPresent()) {
            BrokeragePosition position = positionOpt.get();
            BigDecimal newQty = position.getQuantity().add(qty);
            BigDecimal weighted = position.getAveragePrice().multiply(position.getQuantity()).add(price.multiply(qty));
            BigDecimal newAvg = weighted.divide(newQty, 6, RoundingMode.HALF_UP);
            position.setQuantity(newQty);
            position.setAveragePrice(newAvg);
            position.setUpdatedAt(now);
            brokeragePositionRepository.save(position);
        } else {
            BrokeragePosition position = BrokeragePosition.builder()
                    .account(account)
                    .stock(stock)
                    .quantity(qty)
                    .averagePrice(price)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();
            brokeragePositionRepository.save(position);
        }

        account.setBalance(account.getBalance().subtract(cost));
        brokerageAccountRepository.save(account);

        publishTrade(user, stock, "BUY", qty, price);

        return new AccountSummaryResp(account.getBalance(), mapPositions(account));
    }

    @Transactional
    public AccountSummaryResp sell(TradeRequest request) {
        if (request.getQuantity() <= 0) {
            throw new MessageException("Количество должно быть больше нуля");
        }

        User user = userService.getCurrentUser();
        BrokerageAccount account = getOrCreateAccount(user);
        Stock stock = requireStock(request.getTicker());
        var positionOpt = brokeragePositionRepository.findByAccountAndStock(account, stock);
        if (positionOpt.isEmpty()) {
            throw new MessageException("Нет позиции по " + request.getTicker());
        }

        BrokeragePosition position = positionOpt.get();
        BigDecimal qty = BigDecimal.valueOf(request.getQuantity());
        if (position.getQuantity().compareTo(qty) < 0) {
            throw new MessageException("Недостаточно бумаг для продажи");
        }

        BigDecimal price = getLatestPrice(stock);
        BigDecimal revenue = price.multiply(qty).setScale(4, RoundingMode.HALF_UP);

        BigDecimal newQty = position.getQuantity().subtract(qty);
        if (newQty.compareTo(BigDecimal.ZERO) == 0) {
            brokeragePositionRepository.delete(position);
        } else {
            position.setQuantity(newQty);
            position.setUpdatedAt(LocalDateTime.now());
            brokeragePositionRepository.save(position);
        }

        account.setBalance(account.getBalance().add(revenue));
        brokerageAccountRepository.save(account);

        publishTrade(user, stock, "SELL", qty, price);

        return new AccountSummaryResp(account.getBalance(), mapPositions(account));
    }
}
