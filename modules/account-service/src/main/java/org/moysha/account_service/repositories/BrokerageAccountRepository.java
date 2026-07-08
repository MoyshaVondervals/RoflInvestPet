package org.moysha.account_service.repositories;

import org.moysha.account_service.models.BrokerageAccount;
import org.moysha.account_service.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BrokerageAccountRepository extends JpaRepository<BrokerageAccount, Long> {
    Optional<BrokerageAccount> findByUser(User user);

    boolean existsByUser(User user);

    int deleteBrokerageAccountByUser(User user);
}
