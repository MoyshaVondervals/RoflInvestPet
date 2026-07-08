package org.moysha.account_service.repositories;

import jakarta.transaction.Transactional;
import org.moysha.account_service.enums.GrowPattern;
import org.moysha.account_service.enums.GrowSpeed;
import org.moysha.account_service.models.Stock;
import org.moysha.account_service.models.StockChangeTarget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface StockChangeTargetRepository extends JpaRepository<StockChangeTarget, Long> {
    StockChangeTarget findByStock(Stock stock);

    @Modifying
    @Transactional
    @Query("UPDATE StockChangeTarget u SET u.currentPrice = :currentPrice WHERE u.id = :id")
    int updateCurrentPriceById(Long id, Double currentPrice);

    @Modifying
    @Transactional
    @Query("UPDATE StockChangeTarget u SET u.startPrice = :startPrice WHERE u.id = :id")
    int updateStartPriceById(Long id, Double startPrice);

    @Modifying
    @Transactional
    @Query("UPDATE StockChangeTarget u SET u.targetPercent = :targetPercent WHERE u.id = :id")
    int updateTargetPercentById(Long id, Double targetPercent);

    @Modifying
    @Transactional
    @Query("UPDATE StockChangeTarget u SET u.pattern = :growPattern WHERE u.id = :id")
    int updateGrowPatternById(Long id,  GrowPattern growPattern);

    @Modifying
    @Transactional
    @Query("UPDATE StockChangeTarget u SET u.growSpeed = :growSpeed WHERE u.id = :id")
    int updateGrowSpeedById(Long id, GrowSpeed growSpeed);

    @Modifying
    @Transactional
    @Query("UPDATE StockChangeTarget u SET u.lastUpdated = :lastUpdated WHERE u.id = :id")
    int updateLastUpdatedById(Long id, LocalDateTime lastUpdated);

    @Query(value = "SELECT * FROM stock_change_target", nativeQuery = true)
    List<StockChangeTarget> getAll();

}
