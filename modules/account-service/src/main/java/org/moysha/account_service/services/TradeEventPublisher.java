package org.moysha.account_service.services;

import lombok.RequiredArgsConstructor;
import org.moysha.account_service.config.KafkaTopics;
import org.moysha.account_service.dto.TradeExecutedEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TradeEventPublisher {

    private final KafkaTemplate<String, TradeExecutedEvent> kafkaTemplate;
    private final KafkaTopics topics;

    public void publish(TradeExecutedEvent event) {

        kafkaTemplate.send(topics.tradeExecuted(), event.ticker(), event);
    }
}
