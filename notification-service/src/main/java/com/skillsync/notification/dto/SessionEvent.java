package com.skillsync.notification.dto;

import lombok.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionEvent implements Serializable {
    private String eventType;
    private Long sessionId;
    private Long mentorId;
    private Long learnerId;
    private LocalDateTime sessionTime;
    private String topic;
}
