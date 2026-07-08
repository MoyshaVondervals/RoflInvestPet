package org.moysha.market_service.dto;

public record TradeExecutedEvent(
        String tradeId,
        String userId,
        String ticker,
        String side,
        int quantity,
        long priceInCents,
        long executedAtEpochMs
) {
}
