package org.moysha.account_service.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.moysha.account_service.enums.EconomicalSector;
import org.moysha.account_service.enums.InvestmentStatus;

import java.util.ArrayList;
import java.util.List;

@Entity
@Builder
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Table(name = "stock")
public class Stock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "ticker", nullable = false, unique = true)
    private String ticker;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "sector", nullable = false)
    private EconomicalSector sector;

    @OneToMany(mappedBy = "stock", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<StockPrice> prices = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "available_for", nullable = false)
    private InvestmentStatus availableFor;

    @Lob
    @Basic(fetch = FetchType.LAZY)
    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(name = "logo", columnDefinition = "bytea")
    private byte[] logo;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "change_target_id",
            unique = true,
            foreignKey = @ForeignKey(name = "fk_stock_change_target"))
    private StockChangeTarget changeTarget;

    public void addPrice(StockPrice price) {
        if (price == null) return;
        if (!prices.contains(price)) {
            prices.add(price);
        }
        price.setStock(this);
    }

}
