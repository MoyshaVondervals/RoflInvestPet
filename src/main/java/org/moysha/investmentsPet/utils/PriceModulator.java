package org.moysha.investmentsPet.utils;

import lombok.RequiredArgsConstructor;
import org.moysha.investmentsPet.enums.GrowPattern;
import org.moysha.investmentsPet.enums.GrowSpeed;
import org.moysha.investmentsPet.enums.InvestmentStatus;
import org.moysha.investmentsPet.models.StockChangeTarget;
import org.moysha.investmentsPet.models.StockPrice;
import org.moysha.investmentsPet.repositories.StockPricesRepository;
import org.moysha.investmentsPet.services.PriceBroadcastService;
import org.moysha.investmentsPet.services.StockChangeTargetService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Component
@RequiredArgsConstructor
public class PriceModulator {

    private final StockChangeTargetService stockChangeTargetService;
    private final StockPricesRepository stockPricesRepository;
    private final PriceBroadcastService priceBroadcastService;

    public Double getK(GrowSpeed growSpeed) {
        return switch (growSpeed) {
            case SUPERFAST -> ThreadLocalRandom.current().nextDouble(0.04, 0.06);
            case FAST -> ThreadLocalRandom.current().nextDouble(0.001, 0.04);
            case MEDIUM -> ThreadLocalRandom.current().nextDouble(0.0001, 0.001);
            case SLOW -> ThreadLocalRandom.current().nextDouble(0.00002, 0.0001);
        };
    }

    public Double getCurrentPrice(Double startPrice, Double targetPercent, long progress, Double k, GrowPattern growPattern) {
        return switch (growPattern) {
            case EXPONENTIAL -> startPrice + (startPrice * targetPercent) * (1 - Math.exp(-k * progress));
            case LOGISTIC -> startPrice + (startPrice * targetPercent) * ((1.0 / (1.0 + Math.exp(-2.0 * k * (progress - (startPrice/2)))))-(1.0 / (1.0 + Math.exp(startPrice * k))));
            case TRIGONOMETRIC -> startPrice + (startPrice * targetPercent) * ((1 - Math.cos(Math.PI * Math.min(1, (k / 3.0) * progress))) / 2.0);
        };
    }

    public Double getNoise(InvestmentStatus investmentStatus){

        return switch (investmentStatus){
            case BASIC -> ThreadLocalRandom.current().nextDouble(0.999999, 1.000001);
            case QUALIFIED -> ThreadLocalRandom.current().nextDouble(0.99999, 1.00001);
            case SUPER_QUALIFIED -> ThreadLocalRandom.current().nextDouble(0.9999, 1.0001);
        };
    }


    @Scheduled(cron = "0 */1 * * * *")
    @Async
    public void modulatePrices() {
        System.err.println("Modulating prices");
        List<StockChangeTarget> stockChangeTargetList = stockChangeTargetService.getStockChangeTarget();
        for (StockChangeTarget stockChangeTarget : stockChangeTargetList) {
            System.err.println(stockChangeTarget.getStock().getTicker());
            Double startPrice = stockChangeTarget.getStartPrice();
            Double targetPercent = stockChangeTarget.getTargetPercent();
            LocalDateTime now = LocalDateTime.now();
            long progress = Duration.between(stockChangeTarget.getLastUpdated(), now).toMinutes();
            Double currentPrice = (getCurrentPrice(startPrice, targetPercent, progress, getK(stockChangeTarget.getGrowSpeed()), stockChangeTarget.getPattern()))*getNoise(stockChangeTarget.getStock().getAvailableFor());
            stockChangeTargetService.updatePrice(stockChangeTarget.getId(), currentPrice);
            StockPrice stockPrice = StockPrice.builder()
                    .price(currentPrice)
                    .lastUpdate(now)
                    .stock(stockChangeTarget.getStock())
                    .build();

            stockPricesRepository.save(stockPrice);
            priceBroadcastService.sendPriceUpdate(
                    stockChangeTarget.getStock().getTicker(),
                    currentPrice,
                    now.toInstant(ZoneOffset.UTC).toEpochMilli()
            );
        }

    }



}
