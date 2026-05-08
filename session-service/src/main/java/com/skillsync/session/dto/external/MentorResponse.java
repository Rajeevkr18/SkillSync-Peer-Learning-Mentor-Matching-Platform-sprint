package com.skillsync.session.dto.external;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorResponse {
    private Long id;
    private Long userId;
    private String name;
    private String bio;
    private Integer experience;
    private Double rating;
    private Double hourlyRate;
    private List<String> skills;
    private Boolean available;
    private Boolean approved;
    private LocalDateTime createdAt;
}
