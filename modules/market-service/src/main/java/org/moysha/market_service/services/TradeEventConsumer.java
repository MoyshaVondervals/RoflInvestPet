package org.moysha.market_service.services;

import lombok.RequiredArgsConstructor;
import org.moysha.market_service.dto.TradeExecutedEvent;
import org.moysha.market_service.enums.GrowSpeed;
import org.moysha.market_service.models.StockImpact;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TradeEventConsumer {

    private static final double MAX_IMPACT_PERCENT = 2.0;
    private static final double IMPACT_PER_UNIT = 0.05;

    private final StockChangeTargetService stockChangeTargetService;

    @KafkaListener(
            topics = "${app.kafka.topics.trade-executed}",
            groupId = "${spring.kafka.consumer.group-id}"
    )
    public void onTradeExecuted(TradeExecutedEvent event) {
        if (event == null || event.ticker() == null) {
            return;
        }

        double magnitude = Math.min(event.quantity() * IMPACT_PER_UNIT, MAX_IMPACT_PERCENT);
        boolean isBuy = "BUY".equalsIgnoreCase(event.side());
        double impact = isBuy ? magnitude : -magnitude;

        StockImpact stockImpact = StockImpact.builder()
                .ticker(event.ticker().toUpperCase())
                .impact(impact)
                .growSpeed(GrowSpeed.FAST)
                .build();

        System.err.println("#####   TRADE EVENT -> IMPACT  ##### " + stockImpact);
        stockChangeTargetService.alterTarget(stockImpact);
    }
}
