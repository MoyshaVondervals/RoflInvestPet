package org.moysha.market_service.dto;

import java.util.List;

public record NewsPublishedEvent(
        String newsId,
        String title,
        String text,
        List<String> affectedTickers,
        long createdAtEpochMs
) {
}
