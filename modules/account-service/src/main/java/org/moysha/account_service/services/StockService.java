package org.moysha.account_service.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.moysha.account_service.dto.StockPricesResp;
import org.moysha.account_service.dto.StockTickerReq;
import org.moysha.account_service.dto.NewStockReq;
import org.moysha.account_service.dto.StockRes;
import org.moysha.account_service.enums.GrowPattern;
import org.moysha.account_service.enums.GrowSpeed;
import org.moysha.account_service.exceptions.MessageException;
import org.moysha.account_service.models.Stock;
import org.moysha.account_service.models.StockChangeTarget;
import org.moysha.account_service.models.StockPrice;
import org.moysha.account_service.repositories.BrokerageAccountRepository;
import org.moysha.account_service.repositories.BrokeragePositionRepository;
import org.moysha.account_service.repositories.StockPricesRepository;
import org.moysha.account_service.repositories.StockRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class StockService {
    private final StockRepository repository;
    private final StockPricesRepository stockPricesRepository;
    private final BrokeragePositionRepository brokeragePositionRepository;
    private final BrokerageAccountRepository brokerageAccountRepository;

    public Stock createNewStock(NewStockReq request, MultipartFile logoFile) throws IOException {
        if (logoFile == null || logoFile.isEmpty()) {
            throw new IllegalArgumentException("Logo file is required");
        }

        System.err.println("Uploading file: {} ({} bytes, type: {})"+
                logoFile.getOriginalFilename()+
                logoFile.getSize()+
                logoFile.getContentType());

        byte[] logoBytes = logoFile.getBytes();

        Stock stock = Stock.builder()
                .ticker(request.getTicker())
                .name(request.getName())
                .sector(request.getSector())
                .availableFor(request.getStatus())
                .logo(logoBytes)
                .build();

        StockPrice stockPrice = StockPrice.builder()
                .price(request.getLastPrice())
                .lastUpdate(LocalDateTime.now())
                .build();

        StockChangeTarget changeTarget = StockChangeTarget.builder()
                .stock(stock)
                .currentPrice(request.getLastPrice())
                .startPrice(request.getLastPrice())
                .targetPercent((double) Math.round(ThreadLocalRandom.current().nextDouble(0.02, 0.06)*100)/100)
                .pattern(GrowPattern.LOGISTIC)
                .growSpeed(GrowSpeed.MEDIUM)
                .lastUpdated(LocalDateTime.now())
                .build();

        stock.addPrice(stockPrice);
        stock.setChangeTarget(changeTarget);

        if (repository.existsByTicker(stock.getTicker())) {
            throw new MessageException("Тикер: '"+request.getTicker()+"' уже занят!");
        } else if (repository.existsByName(stock.getName())) {
            throw new MessageException("Имя акции: '"+request.getName()+"' уже занято!");
        } else{
            return repository.save(stock);
        }

    }

    public List<StockRes> getStocksList() {
        List<Stock> stockList = repository.findAll();
        List<StockRes> stockResList = new ArrayList<>();
        for (Stock stock : stockList) {
            stockResList.add(new StockRes(stock, stockPricesRepository.findLatestPrice(stock.getId()).get(0).getPrice()));
        }
        return stockResList;

    }

    public Optional<Stock> getById(Long id){
        return repository.findById(id);
    }

    @Transactional
    public void deleteStock(StockTickerReq request) {
        String ticker = request.getTicker().toUpperCase();
        Stock stock = repository.findByTicker(ticker);
        if (stock == null) {
            throw new MessageException("Такой акции нет");
        }

        var latestPrices = stockPricesRepository.findLatestPrice(stock.getId());
        BigDecimal latestPrice = latestPrices.isEmpty()
                ? null
                : BigDecimal.valueOf(latestPrices.get(0).getPrice());

        var positions = brokeragePositionRepository.findAllByStock(stock);
        for (var position : positions) {
            BigDecimal price = latestPrice != null ? latestPrice : position.getAveragePrice();
            BigDecimal revenue = price.multiply(position.getQuantity()).setScale(4, RoundingMode.HALF_UP);
            var account = position.getAccount();
            account.setBalance(account.getBalance().add(revenue));
            brokerageAccountRepository.save(account);
        }
        brokeragePositionRepository.deleteAll(positions);
        repository.delete(stock);
    }

    public StockPricesResp getStockPrices(StockTickerReq request) {

        Stock stock = repository.findByTicker(request.getTicker());

        List<StockPrice> stockPrices = stockPricesRepository.findLatestPrice(stock.getId());
        List<Double> prices = stockPrices.stream().map(StockPrice::getPrice).toList();
        List<Long> timestamps = stockPrices.stream()
                .map(StockPrice::getLastUpdate)
                .map(ldt -> ldt.toInstant(ZoneOffset.UTC))
                .map(Instant::toEpochMilli)
                .toList();
        StockPricesResp stockPricesResp = new StockPricesResp(stock.getName(), stock.getLogo(), prices, timestamps);
        return stockPricesResp;

    }

}
