package org.moysha.investmentsPet.models;

import jakarta.persistence.*;
import lombok.*;
import org.moysha.investmentsPet.enums.GrowPattern;
import org.moysha.investmentsPet.enums.GrowSpeed;

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

    @Column(name = "pattern")
    private GrowPattern pattern;

    @Column(name = "growSpeed")
    private GrowSpeed growSpeed;

    @Column(name = "lastUpdated")
    private LocalDateTime lastUpdated;
}
