package org.moysha.market_service.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.moysha.market_service.models.BrokerageAccount;
import org.moysha.market_service.models.User;
import org.springframework.stereotype.Service;
import org.moysha.market_service.repositories.BrokerageAccountRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BrokerageAccountService {
    private final BrokerageAccountRepository brokerageAccountRepository;

    public BrokerageAccount createBrokerageAccount(User user) {
        var brokerageAccount = BrokerageAccount.builder()
                .user(user)
                .balance(BigDecimal.valueOf(1000))
                .createdAt(LocalDateTime.now())
                .build();
        return brokerageAccountRepository.save(brokerageAccount);
    }
    @Transactional
    public void deleteBrockerageAccount(User user) {
        brokerageAccountRepository.deleteBrokerageAccountByUser(user);
    }

}
