package org.moysha.account_service.dto;

import java.util.Map;

public record PortfolioResponse(
        String userId,
        long cashInCents,
        Map<String, Integer> positions
) {
}
