package org.moysha.investmentsPet.services;

import lombok.RequiredArgsConstructor;
import org.moysha.investmentsPet.models.BrokerageAccount;
import org.moysha.investmentsPet.models.User;
import org.springframework.stereotype.Service;
import org.moysha.investmentsPet.repositories.BrokerageAccountRepository;

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


}
