package com.skillsync.session.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@Slf4j
public class GoogleCalendarService {

    public String createMeetLink(String topic, String startTime) {
        // In a real implementation, this would use Google Calendar API
        // For now, we simulate link generation for demonstration
        String meetId = UUID.randomUUID().toString().substring(0, 10).replace("-", "");
        String link = "https://meet.google.com/" + meetId;
        log.info("Generated mock Google Meet link for topic '{}': {}", topic, link);
        return link;
    }
}
