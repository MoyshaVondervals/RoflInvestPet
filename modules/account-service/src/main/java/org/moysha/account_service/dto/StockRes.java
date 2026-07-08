package org.moysha.account_service.dto;

import lombok.Data;
import org.moysha.account_service.enums.EconomicalSector;
import org.moysha.account_service.enums.InvestmentStatus;
import org.moysha.account_service.models.Stock;

import java.util.Base64;

@Data

public class StockRes {
    private String ticker;
    private String name;
    private EconomicalSector sector;
    private double lastPrice;
    private InvestmentStatus status;
    private String logoBase64;
    public StockRes(Stock stock, double lastPrice) {
        this.ticker = stock.getTicker();
        this.name = stock.getName();
        this.sector = stock.getSector();
        this.lastPrice = lastPrice;
        this.status = stock.getAvailableFor();
        this.logoBase64 = Base64.getEncoder().encodeToString(stock.getLogo());
    }
}
