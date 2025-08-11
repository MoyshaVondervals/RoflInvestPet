package org.moysha.investmentsPet.repositories;

import jakarta.transaction.Transactional;
import org.moysha.investmentsPet.models.Stock;
import org.moysha.investmentsPet.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, Long> {
    Optional<Stock> findByName(String name);
    boolean existsByName(String name);
    boolean existsByTicker(String ticker);
    @Transactional
    int removeByTicker(@Param("ticker") String ticker);
    @Query(value = "SELECT * FROM stock", nativeQuery = true)
    List<Stock> getAll();
}
