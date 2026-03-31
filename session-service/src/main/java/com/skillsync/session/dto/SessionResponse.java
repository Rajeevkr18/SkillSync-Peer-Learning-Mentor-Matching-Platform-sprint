package com.skillsync.session.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionResponse {
    private Long id;
    private Long mentorId;
    private Long learnerId;
    private LocalDateTime sessionDate;
    private Integer duration;
    private String topic;
    private String notes;
    private String status;
    private LocalDateTime createdAt;
}
