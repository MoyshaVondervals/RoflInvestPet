package org.moysha.investmentsPet.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;
import org.moysha.investmentsPet.enums.EconomicalSector;

import java.util.ArrayList;

@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class News {
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title")
    private String title;

    @Column(name = "text")
    private String text;

    @Column(name = "created_at", nullable = false)
    private java.time.LocalDateTime createdAt;



}
