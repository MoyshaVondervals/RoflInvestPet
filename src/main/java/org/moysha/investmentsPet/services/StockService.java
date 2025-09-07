package org.moysha.investmentsPet.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.moysha.investmentsPet.dto.StockPricesResp;
import org.moysha.investmentsPet.dto.StockTickerReq;
import org.moysha.investmentsPet.dto.NewStockReq;
import org.moysha.investmentsPet.dto.StockRes;
import org.moysha.investmentsPet.exceptions.MessageException;
import org.moysha.investmentsPet.models.Stock;
import org.moysha.investmentsPet.models.StockPrice;
import org.moysha.investmentsPet.repositories.StockPricesRepository;
import org.moysha.investmentsPet.repositories.StockRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockService {
    private final StockRepository repository;
    private final StockPricesRepository stockPricesRepository;

    public Stock createNewStock(NewStockReq request, MultipartFile logoFile) throws IOException {
        if (logoFile == null || logoFile.isEmpty()) {
            throw new IllegalArgumentException("Logo file is required");
        }

        System.err.println("Uploading file: {} ({} bytes, type: {})"+
                logoFile.getOriginalFilename()+
                logoFile.getSize()+
                logoFile.getContentType());

        byte[] logoBytes = logoFile.getBytes();

        Stock stock = Stock.builder()
                .ticker(request.getTicker())
                .name(request.getName())
                .sector(request.getSector())
                .availableFor(request.getStatus())
                .logo(logoBytes)
                .build();

        StockPrice stockPrice = StockPrice.builder()
                .price(request.getLastPrice())
                .lastUpdate(LocalDateTime.now())
                .build();

        stock.addPrice(stockPrice);



        if (repository.existsByTicker(stock.getTicker())) {
            throw new MessageException("Тикер: '"+request.getTicker()+"' уже занят!");
        } else if (repository.existsByName(stock.getName())) {
            throw new MessageException("Имя акции: '"+request.getName()+"' уже занято!");
        } else{
            return repository.save(stock);
        }

    }


    public List<StockRes> getStocksList() {
        List<Stock> stockList = repository.findAll();
        List<StockRes> stockResList = new ArrayList<>();
        for (Stock stock : stockList) {
            stockResList.add(new StockRes(stock, stockPricesRepository.findLatestPrice(stock.getId()).get(0).getPrice()));
        }
        return stockResList;

    }

    @Scheduled(cron = "0 */1 * * * *")
    @Async
    @Transactional
    public void getAiNews() throws IOException, InterruptedException {
        List<Stock> stockList = repository.findAll();
        for (Stock stock : stockList) {
            StockPrice lastPrice = stockPricesRepository
                    .findLatestPrice(stock.getId())
                    .get(0);
            Double lastPriceValue = lastPrice.getPrice();
            System.err.println(stock.getTicker()+" | "+lastPriceValue);
            StockPrice stockPrice = StockPrice.builder()
                    .price(lastPriceValue*1.02)
                    .lastUpdate(LocalDateTime.now())
                    .stock(stock)
                    .build();

            stockPricesRepository.save(stockPrice);

        }





    }


    @Transactional
    public void deleteStock(StockTickerReq request) {
        System.err.println("meow1");
        if (repository.existsByTicker(request.getTicker())) {
            System.err.println("meow2");
            repository.removeByTicker(request.getTicker());
            System.err.println("meow3");
        }else{
            System.err.println("meow4");
            throw new MessageException("Такой акции нет");

        }

    }


    public StockPricesResp getStockPrices(StockTickerReq request) {

        Stock stock = repository.findByTicker(request.getTicker());

        List<StockPrice> stockPrices = stockPricesRepository.findLatestPrice(stock.getId());
        List<Double> prices = stockPrices.stream().map(StockPrice::getPrice).toList();
        List<Long> timestamps = stockPrices.stream()
                .map(StockPrice::getLastUpdate)
                .map(ldt -> ldt.toInstant(ZoneOffset.UTC))
                .map(Instant::toEpochMilli)
                .toList();
        StockPricesResp stockPricesResp = new StockPricesResp(stock.getName(), stock.getLogo(), prices, timestamps);
        return stockPricesResp;

    }




}
