package org.moysha.account_service.dto;

import lombok.Data;

import java.util.Base64;
import java.util.List;

@Data
public class StockPricesResp {

    private String name;
    private String logo;
    private List<Double> prices;
    private List<Long> timestamps;

    public StockPricesResp(String name, byte[] logo, List<Double> prices, List<Long> timestamps) {
        this.name = name;
        this.logo = (logo != null)
                ? Base64.getEncoder().encodeToString(logo)
                : null;;
        this.prices = prices;
        this.timestamps = timestamps;
    }
}
