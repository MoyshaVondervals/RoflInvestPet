package org.moysha.account_service.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.moysha.account_service.dto.AccountSummaryResp;
import org.moysha.account_service.dto.TradeRequest;
import org.moysha.account_service.services.PortfolioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/portfolio")
@RequiredArgsConstructor
@Tag(name = "Портфель")
public class PortfolioController {

    private final PortfolioService portfolioService;

    @GetMapping("/account")
    @Operation(summary = "Получить брокерский счет и позиции")
    public ResponseEntity<AccountSummaryResp> getAccount() {
        return ResponseEntity.ok(portfolioService.getAccountSummary());
    }

    @PostMapping("/buy")
    @Operation(summary = "Купить акцию по текущей цене")
    public ResponseEntity<AccountSummaryResp> buy(@Valid @RequestBody TradeRequest request) {
        return ResponseEntity.ok(portfolioService.buy(request));
    }

    @PostMapping("/sell")
    @Operation(summary = "Продать акцию по текущей цене")
    public ResponseEntity<AccountSummaryResp> sell(@Valid @RequestBody TradeRequest request) {
        return ResponseEntity.ok(portfolioService.sell(request));
    }
}
