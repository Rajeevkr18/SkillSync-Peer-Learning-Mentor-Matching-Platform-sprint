package com.skillsync.mentor.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "mentors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mentor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String bio;

    private Integer experience;

    @Builder.Default
    private Double rating = 0.0;

    private Double hourlyRate;

    @Convert(converter = com.skillsync.mentor.converter.StringListConverter.class)
    private List<String> skills;

    @Builder.Default
    private Boolean available = true;

    @Builder.Default
    private Boolean approved = false;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
