package org.moysha.market_service.dto;

public record StockResponse(
        String ticker,
        long priceInCents
) {
}
