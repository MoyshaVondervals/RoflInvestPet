package org.moysha.market_service.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.moysha.market_service.enums.GrowPattern;
import org.moysha.market_service.models.Stock;
import org.moysha.market_service.models.StockChangeTarget;
import org.moysha.market_service.models.StockImpact;
import org.moysha.market_service.repositories.StockChangeTargetRepository;
import org.moysha.market_service.repositories.StockRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class StockChangeTargetService {
    private final StockChangeTargetRepository repository;
    private final StockRepository stockRepository;

    @Transactional
    public void alterTarget(StockImpact impact) {
        try {
            System.err.println(impact.toString());
            Stock stock = stockRepository.findByTicker(impact.getTicker());
            StockChangeTarget stockChangeTarget = repository.findByStock(stock);
            repository.updateStartPriceById(stockChangeTarget.getId(), repository.findByStock(stock).getCurrentPrice());
            repository.updateTargetPercentById(stockChangeTarget.getId(), Math.round((stockChangeTarget.getTargetPercent() + impact.getImpact() / 100.0) * 10000.0) / 10000.0);
            repository.updateGrowPatternById(stockChangeTarget.getId(), GrowPattern.values()[new Random().nextInt(GrowPattern.values().length)]);
            repository.updateGrowSpeedById(stockChangeTarget.getId(), impact.getGrowSpeed());
            repository.updateLastUpdatedById(stockChangeTarget.getId(), LocalDateTime.now());
        }catch (Exception e){
            e.printStackTrace();
        }
    }

    public List<StockChangeTarget> getStockChangeTarget(){
        return repository.findAllWithStock();
    }

    public void updatePrice(Long id, Double currentPrice) {
        repository.updateCurrentPriceById(id, currentPrice);
    }

}
