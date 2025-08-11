package org.moysha.investmentsPet.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.moysha.investmentsPet.dto.DeleteStock;
import org.moysha.investmentsPet.dto.NewStockReq;
import org.moysha.investmentsPet.dto.StockRes;
import org.moysha.investmentsPet.models.Stock;
import org.moysha.investmentsPet.services.StockService;
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
        stockService.createNewStock(newStockReq, logoFile);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/getStocksList")
    @Operation(summary = "Получить список акций")
    public ResponseEntity<List<StockRes>> getStocksList() {
        System.err.println("#####   GET STOCKS LIST  #####");
        List<Stock>  stocksList = stockService.getStocksList();
        List<StockRes> stockResList = stocksList.stream().map(StockRes::new).toList();
        return ResponseEntity.ok(stockResList);
    }

    @PostMapping("/deleteStock")
    @Operation(summary = "Удалить акцию")
    public ResponseEntity<Void> deleteStock(@RequestBody @Valid DeleteStock deleteStock) {
        stockService.deleteStock(deleteStock);
        return ResponseEntity.ok().build();
    }
}
