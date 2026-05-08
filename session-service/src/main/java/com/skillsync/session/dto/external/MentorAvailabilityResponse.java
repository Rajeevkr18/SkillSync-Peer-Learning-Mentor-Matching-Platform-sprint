package com.skillsync.session.dto.external;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorAvailabilityResponse {
    private Long id;
    private Long mentorId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean isBooked;
}
