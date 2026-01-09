package org.moysha.investmentsPet.services;


import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.moysha.investmentsPet.enums.GrowPattern;
import org.moysha.investmentsPet.models.Stock;
import org.moysha.investmentsPet.models.StockChangeTarget;
import org.moysha.investmentsPet.models.StockImpact;
import org.moysha.investmentsPet.repositories.StockChangeTargetRepository;
import org.moysha.investmentsPet.repositories.StockRepository;
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
        return repository.findAll();
    }

    public void updatePrice(Long id, Double currentPrice) {
        repository.updateCurrentPriceById(id, currentPrice);
    }

}
