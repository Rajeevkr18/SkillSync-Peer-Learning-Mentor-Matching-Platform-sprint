package com.skillsync.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStats {
    private Long totalUsers;
    private Long totalMentors;
    private Long totalSessions;
    private Double totalRevenue;
}
