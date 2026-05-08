package com.skillsync.session.service;

import com.skillsync.session.dto.*;
import com.skillsync.session.entity.*;
import com.skillsync.session.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionService {

    private final SessionRepository repository;
    private final RabbitTemplate rabbitTemplate;
    private final com.skillsync.session.client.UserClient userClient;
    private final com.skillsync.session.client.MentorClient mentorClient;
    private final com.skillsync.session.service.GoogleCalendarService googleCalendarService;

    @Value("${rabbitmq.exchange}")
    private String exchange;

    @Value("${rabbitmq.routing-key.session-booked}")
    private String sessionBookedRoutingKey;

    @Value("${rabbitmq.routing-key.session-accepted}")
    private String sessionAcceptedRoutingKey;

    public SessionResponse bookSession(SessionRequest request) {
        // Validate learner existence
        try {
            userClient.getUserProfile(request.getLearnerId());
        } catch (Exception e) {
            throw new RuntimeException("Learner not found: " + request.getLearnerId());
        }

        // Validate mentor existence
        try {
            mentorClient.getMentorById(request.getMentorId());
        } catch (Exception e) {
            throw new RuntimeException("Mentor not found: " + request.getMentorId());
        }

        // Validate availability if slotId is provided
        if (request.getAvailabilityId() != null) {
            try {
                mentorClient.markSlotAsBooked(request.getAvailabilityId());
            } catch (Exception e) {
                throw new RuntimeException("Failed to book slot: " + request.getAvailabilityId());
            }
        }

        MentoringSession session = MentoringSession.builder()
                .mentorId(request.getMentorId())
                .learnerId(request.getLearnerId())
                .sessionDate(request.getSessionDate())
                .availabilityId(request.getAvailabilityId())
                .duration(request.getDuration())
                .topic(request.getTopic())
                .notes(request.getNotes())
                .status(SessionStatus.REQUESTED)
                .build();

        session = repository.save(session);

        // Publish SESSION_BOOKED event
        try {
            SessionEvent event = SessionEvent.builder()
                    .eventType("SESSION_BOOKED")
                    .sessionId(session.getId())
                    .mentorId(session.getMentorId())
                    .learnerId(session.getLearnerId())
                    .sessionTime(session.getSessionDate())
                    .topic(session.getTopic())
                    .build();
            rabbitTemplate.convertAndSend(exchange, sessionBookedRoutingKey, event);
            log.info("Published SESSION_BOOKED event for session: {}", session.getId());
        } catch (Exception e) {
            log.warn("Failed to publish SESSION_BOOKED event: {}", e.getMessage());
        }

        return mapToResponse(session);
    }

    public SessionResponse acceptSession(Long id) {
        MentoringSession session = findSession(id);
        session.setStatus(SessionStatus.ACCEPTED);
        
        // Generate Meeting Link
        String link = googleCalendarService.createMeetLink(session.getTopic(), session.getSessionDate().toString());
        session.setMeetingLink(link);
        
        session = repository.save(session);

        // Publish SESSION_ACCEPTED event
        try {
            SessionEvent event = SessionEvent.builder()
                    .eventType("SESSION_ACCEPTED")
                    .sessionId(session.getId())
                    .mentorId(session.getMentorId())
                    .learnerId(session.getLearnerId())
                    .sessionTime(session.getSessionDate())
                    .topic(session.getTopic())
                    .build();
            rabbitTemplate.convertAndSend(exchange, sessionAcceptedRoutingKey, event);
            log.info("Published SESSION_ACCEPTED event for session: {}", session.getId());
        } catch (Exception e) {
            log.warn("Failed to publish SESSION_ACCEPTED event: {}", e.getMessage());
        }

        return mapToResponse(session);
    }

    public SessionResponse rejectSession(Long id) {
        MentoringSession session = findSession(id);
        session.setStatus(SessionStatus.REJECTED);
        return mapToResponse(repository.save(session));
    }

    public SessionResponse cancelSession(Long id) {
        MentoringSession session = findSession(id);
        session.setStatus(SessionStatus.CANCELLED);
        return mapToResponse(repository.save(session));
    }

    public SessionResponse completeSession(Long id) {
        MentoringSession session = findSession(id);
        session.setStatus(SessionStatus.COMPLETED);
        return mapToResponse(repository.save(session));
    }

    public List<SessionResponse> getUserSessions(Long userId) {
        Long mentorId = null;
        try {
            com.skillsync.session.dto.external.MentorResponse mentor = mentorClient.getMentorByUserId(userId);
            if (mentor != null) {
                mentorId = mentor.getId();
            }
        } catch (Exception e) {
            log.debug("User {} is not a mentor or mentor-service is unavailable", userId);
        }

        if (mentorId != null) {
            return repository.findByLearnerIdOrMentorId(userId, mentorId).stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }
        
        return repository.findByLearnerId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<SessionResponse> getMentorSessions(Long mentorId) {
        return repository.findByMentorId(mentorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<SessionResponse> getAllSessions() {
        return repository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deleteSession(Long id) {
        MentoringSession session = findSession(id);
        repository.delete(session);
    }

    private MentoringSession findSession(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session not found: " + id));
    }

    private SessionResponse mapToResponse(MentoringSession session) {
        return SessionResponse.builder()
                .id(session.getId())
                .mentorId(session.getMentorId())
                .learnerId(session.getLearnerId())
                .sessionDate(session.getSessionDate())
                .duration(session.getDuration())
                .topic(session.getTopic())
                .notes(session.getNotes())
                .status(session.getStatus().name())
                .meetingLink(session.getMeetingLink())
                .createdAt(session.getCreatedAt())
                .build();
    }
}
