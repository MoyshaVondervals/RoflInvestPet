package org.moysha.investmentsPet.dto;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TradeRequest {

    @NotBlank
    private String ticker;

    @Positive
    private double quantity;
}
