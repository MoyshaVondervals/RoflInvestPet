package org.moysha.market_service.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.moysha.market_service.enums.GrowPattern;
import org.moysha.market_service.enums.GrowSpeed;

@Data
@AllArgsConstructor
@Builder
public class StockImpact {
    private String ticker;
    private double impact;
    private GrowSpeed growSpeed;

}
