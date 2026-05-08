package com.skillsync.analytics.service;

import com.skillsync.analytics.dto.AdminStats;
import com.skillsync.analytics.dto.MentorStats;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsService {

    public AdminStats getAdminStats() {
        // In a real implementation, this would aggregate data from user-service, session-service, etc.
        // For demonstration, returning high-impact mock data
        return AdminStats.builder()
                .totalUsers(150L)
                .totalMentors(45L)
                .totalSessions(320L)
                .totalRevenue(12500.0)
                .build();
    }

    public MentorStats getMentorStats(Long mentorId) {
        // Mock data for mentor analytics
        return MentorStats.builder()
                .totalSessions(24L)
                .totalEarnings(1200.0)
                .averageRating(4.8)
                .activeStudents(12L)
                .build();
    }
}
