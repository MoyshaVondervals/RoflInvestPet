package org.moysha.investmentsPet.services;

import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.hibernate.sql.Delete;
import org.moysha.investmentsPet.dto.DeleteStock;
import org.moysha.investmentsPet.dto.NewStockReq;
import org.moysha.investmentsPet.exceptions.MessageException;
import org.moysha.investmentsPet.models.Stock;
import org.moysha.investmentsPet.repositories.StockRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockService {
    private final StockRepository repository;

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
                .lastPrice(request.getLastPrice())
                .availableFor(request.getStatus())
                .logo(logoBytes)
                .build();
        if (repository.existsByTicker(stock.getTicker())) {
            throw new MessageException("Тикер: '"+request.getTicker()+"' уже занят!");
        } else if (repository.existsByName(stock.getName())) {
            throw new MessageException("Имя акции: '"+request.getName()+"' уже занято!");
        } else{
            return repository.save(stock);
        }

    }


    public List<Stock> getStocksList() {
        return repository.findAll();
    }

    @Transactional
    public void deleteStock(DeleteStock request) {
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
}
