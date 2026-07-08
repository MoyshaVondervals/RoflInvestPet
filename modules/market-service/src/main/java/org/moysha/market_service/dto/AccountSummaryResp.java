package org.moysha.market_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class AccountSummaryResp {
    private BigDecimal balance;
    private List<PositionResp> positions;
}
