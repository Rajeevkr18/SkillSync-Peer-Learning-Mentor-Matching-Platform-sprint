package com.skillsync.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorStats {
    private Long totalSessions;
    private Double totalEarnings;
    private Double averageRating;
    private Long activeStudents;
}
