package org.moysha.market_service.repositories;

import org.moysha.market_service.models.BrokerageAccount;
import org.moysha.market_service.models.BrokeragePosition;
import org.moysha.market_service.models.Stock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BrokeragePositionRepository extends JpaRepository<BrokeragePosition, Long> {
    Optional<BrokeragePosition> findByAccountAndStock(BrokerageAccount account, Stock stock);
    List<BrokeragePosition> findAllByAccount(BrokerageAccount account);
    List<BrokeragePosition> findAllByStock(Stock stock);
    void deleteByAccountAndStock(BrokerageAccount account, Stock stock);
}
