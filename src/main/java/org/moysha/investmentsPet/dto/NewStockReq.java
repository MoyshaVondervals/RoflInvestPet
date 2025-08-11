package org.moysha.investmentsPet.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.moysha.investmentsPet.enums.EconomicalSector;
import org.moysha.investmentsPet.enums.InvestmentStatus;
import org.moysha.investmentsPet.validators.InvestmentStatusValidation;
import org.moysha.investmentsPet.validators.LastPriceValidation;
import org.moysha.investmentsPet.validators.SectorValidation;
import org.moysha.investmentsPet.validators.TickerValidation;

@Data
public class NewStockReq {
    @Schema(description = "Тикер", example = "PLZL")
    @NotBlank(message = "Тикер не может быть пустым")
    @TickerValidation(message = "Не валидное имя тикера")
    private String ticker;

    @Schema(description = "Имя актива", example = "Полюс")
    @NotBlank(message = "Имя актива не может быть пустым")
    @Size(min = 2, max = 50, message = "Имя актива должно содержать от 2 до 50 символов")
    private String name;

    @Schema(description = "Сектор экономики", example = "Energy")
    @NotNull(message = "Сектор не может быть пустым")
    @SectorValidation(message = "Сектор не валиден")
    private EconomicalSector sector;

    @Schema(description = "Цена", example = "100")
    @Positive(message = "Цена должна быть положительным числом")
    @NotNull(message = "Цена обязательна")
    @LastPriceValidation(message = "не валидная цена актива")
    private double lastPrice;

    @NotNull(message = "Статус инвестора не валиден")
    @InvestmentStatusValidation(message = "Статус инвестора не должен быть пустым")
    private InvestmentStatus status;


}
