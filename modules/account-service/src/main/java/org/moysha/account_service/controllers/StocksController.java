package org.moysha.account_service.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.moysha.account_service.dto.StockPricesResp;
import org.moysha.account_service.dto.StockTickerReq;
import org.moysha.account_service.dto.NewStockReq;
import org.moysha.account_service.dto.StockRes;
import org.moysha.account_service.services.StockService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/stocks")
@RequiredArgsConstructor
@Tag(name = "Акции")
public class StocksController {
    private final StockService stockService;

    @PostMapping(value = "/newStock", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> createNewStock(
            @RequestPart("payload") @Valid NewStockReq newStockReq,
            @RequestPart("logo") @Valid MultipartFile logoFile
    ) throws IOException {
        System.err.println("#####   NEW STOCK  #####");
        stockService.createNewStock(newStockReq, logoFile);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/getStocksList")
    @Operation(summary = "Получить список акций")

    public ResponseEntity<List<StockRes>> getStocksList() {
        System.err.println("#####   GET STOCKS LIST  #####");

        return ResponseEntity.ok(stockService.getStocksList());
    }

    @PostMapping("/deleteStock")
    @Operation(summary = "Удалить акцию")
    public ResponseEntity<Void> deleteStock(@RequestBody @Valid StockTickerReq deleteStock) {
        stockService.deleteStock(deleteStock);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/getStockPrices")
    @Operation(summary = "Получить историю цен акций")
    public ResponseEntity<StockPricesResp>  getStockPrices(@RequestBody @Valid StockTickerReq stockTickerReq) {
        try{
            return ResponseEntity.ok(stockService.getStockPrices(stockTickerReq));
        }catch (Exception e){
            System.err.println("#####   GET STOCK PRICES ERROR  #####");
            return ResponseEntity.badRequest().build();
        }

    }
}
