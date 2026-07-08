package org.moysha.market_service.dto;

public record PriceTickEvent(
        String ticker,
        long priceInCents,
        long timestampEpochMs,
        String source
) {
}
