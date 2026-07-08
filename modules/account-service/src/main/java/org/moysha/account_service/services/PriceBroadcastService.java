package org.moysha.account_service.services;

import lombok.RequiredArgsConstructor;
import org.moysha.account_service.dto.StockPriceUpdate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PriceBroadcastService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendPriceUpdate(String ticker, Double price, Long timestamp) {
        if (ticker == null || price == null || timestamp == null) {
            return;
        }
        StockPriceUpdate payload = new StockPriceUpdate(ticker.toUpperCase(), price, timestamp);
        messagingTemplate.convertAndSend("/topic/stocks/" + payload.getTicker(), payload);
    }
}
