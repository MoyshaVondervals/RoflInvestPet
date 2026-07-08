package org.moysha.market_service.models;

import jakarta.persistence.*;
import lombok.*;
import org.moysha.market_service.enums.GrowPattern;
import org.moysha.market_service.enums.GrowSpeed;

import java.time.LocalDateTime;

@Entity
@Builder
@Getter
@Setter
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "stock_change_target")
public class StockChangeTarget {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, mappedBy = "changeTarget")
    private Stock stock;

    @Column(name = "currentPrice", nullable = false)
    private Double currentPrice;

    @Column(name = "startPrice", nullable = false)
    private Double startPrice;

    @Column(name = "targetPercent")
    private Double targetPercent;

    @Enumerated(EnumType.STRING)
    @Column(name = "pattern")
    private GrowPattern pattern;

    @Enumerated(EnumType.STRING)
    @Column(name = "growSpeed")
    private GrowSpeed growSpeed;

    @Column(name = "lastUpdated")
    private LocalDateTime lastUpdated;
}
