package org.moysha.market_service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record PriceUpdateRequest(
        @NotBlank String ticker,
        @Min(1) long priceInCents
) {
}
