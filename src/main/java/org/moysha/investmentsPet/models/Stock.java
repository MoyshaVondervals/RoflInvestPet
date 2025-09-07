package org.moysha.investmentsPet.models;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.moysha.investmentsPet.enums.EconomicalSector;
import org.moysha.investmentsPet.enums.InvestmentStatus;

import java.util.ArrayList;
import java.util.List;

@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Stock {
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticker", nullable = false, unique = true)
    private String ticker;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "sector", nullable = false)
    private EconomicalSector sector;

    @OneToMany(mappedBy = "stock", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<StockPrice> prices = new ArrayList<>();

    @Column(name = "available_for", nullable = false)
    private InvestmentStatus availableFor;

    @Lob
    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(name = "logo", columnDefinition = "bytea")
    private byte[] logo;


    public void addPrice(StockPrice price) {
        prices.add(price);
        price.setStock(this);
    }
}
