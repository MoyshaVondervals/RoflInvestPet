package org.moysha.investmentsPet.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StockPriceUpdate {
    private String ticker;
    private Double price;
    private Long timestamp;
}
