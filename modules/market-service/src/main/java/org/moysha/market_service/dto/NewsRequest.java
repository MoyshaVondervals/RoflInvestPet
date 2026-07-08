package org.moysha.market_service.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record NewsRequest(
        @NotBlank String title,
        @NotBlank String text,
        List<String> affectedTickers
) {
}
