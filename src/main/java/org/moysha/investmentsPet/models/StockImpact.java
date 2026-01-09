package org.moysha.investmentsPet.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.moysha.investmentsPet.enums.GrowPattern;
import org.moysha.investmentsPet.enums.GrowSpeed;

@Data
@AllArgsConstructor
@Builder
public class StockImpact {
    private String ticker;
    private double impact;
    private GrowSpeed growSpeed;


}
