package org.moysha.account_service.repositories;

import org.moysha.account_service.models.StockPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.awt.print.Pageable;
import java.util.List;

public interface StockPricesRepository extends JpaRepository<StockPrice, Long> {
    @Query("SELECT sp FROM StockPrice sp " +
            "WHERE sp.stock.id = :stockId " +
            "ORDER BY sp.lastUpdate DESC")
    List<StockPrice> findLatestPrice(@Param("stockId") Long stockId);

    List<StockPrice> findByStockId(Long stockId);
}
