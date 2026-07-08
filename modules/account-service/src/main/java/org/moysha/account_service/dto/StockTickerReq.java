package org.moysha.account_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.moysha.account_service.validators.TickerValidation;

@Data
public class StockTickerReq {
    @Schema(description = "Тикер", example = "PLZL")
    @NotBlank(message = "Тикер не может быть пустым")
    @TickerValidation(message = "Не валидное имя тикера")
    private String ticker;
}
