package com.skillsync.analytics.controller;

import com.skillsync.analytics.dto.AdminStats;
import com.skillsync.analytics.dto.MentorStats;
import com.skillsync.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/admin")
    public ResponseEntity<AdminStats> getAdminStats() {
        return ResponseEntity.ok(analyticsService.getAdminStats());
    }

    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<MentorStats> getMentorStats(@PathVariable Long mentorId) {
        return ResponseEntity.ok(analyticsService.getMentorStats(mentorId));
    }
}
