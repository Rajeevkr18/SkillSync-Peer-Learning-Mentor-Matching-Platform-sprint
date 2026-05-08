package com.skillsync.mentor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
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
