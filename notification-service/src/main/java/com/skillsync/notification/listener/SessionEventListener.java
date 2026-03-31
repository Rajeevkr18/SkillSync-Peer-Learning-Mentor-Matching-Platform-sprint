package com.skillsync.notification.listener;

import com.skillsync.notification.dto.SessionEvent;
import com.skillsync.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SessionEventListener {

    private final NotificationService notificationService;

    @RabbitListener(queues = "${rabbitmq.queue.session}")
    public void handleSessionEvent(SessionEvent event) {
        log.info("Received session event: {} for session: {}", event.getEventType(), event.getSessionId());

        switch (event.getEventType()) {
            case "SESSION_BOOKED":
                // Notify the mentor
                notificationService.createNotification(
                        event.getMentorId(),
                        String.format("New session request for '%s' on %s",
                                event.getTopic(), event.getSessionTime()),
                        "SESSION_BOOKED"
                );
                // Notify the learner
                notificationService.createNotification(
                        event.getLearnerId(),
                        String.format("Your session request for '%s' has been submitted",
                                event.getTopic()),
                        "SESSION_BOOKED"
                );
                break;

            case "SESSION_ACCEPTED":
                // Notify the learner
                notificationService.createNotification(
                        event.getLearnerId(),
                        String.format("Your session '%s' on %s has been accepted!",
                                event.getTopic(), event.getSessionTime()),
                        "SESSION_ACCEPTED"
                );
                break;

            default:
                log.warn("Unknown event type: {}", event.getEventType());
        }
    }
}
