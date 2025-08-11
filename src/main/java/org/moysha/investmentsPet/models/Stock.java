package org.moysha.investmentsPet.models;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;
import org.hibernate.type.SqlTypes;
import org.moysha.investmentsPet.enums.EconomicalSector;
import org.moysha.investmentsPet.enums.InvestmentStatus;

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

    @Column(name = "last_price", nullable = false)
    private double lastPrice;

    @Column(name = "available_for", nullable = false)
    private InvestmentStatus availableFor;

    @Lob
    @JdbcTypeCode(SqlTypes.BINARY)  // New annotation in Hibernate 6+
    @Column(name = "logo", columnDefinition = "bytea")
    private byte[] logo;
}
