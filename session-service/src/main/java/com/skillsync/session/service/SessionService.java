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
            userClient.getUserProfile(request.getMentorId());
        } catch (Exception e) {
            throw new RuntimeException("Mentor not found: " + request.getMentorId());
        }

        MentoringSession session = MentoringSession.builder()
                .mentorId(request.getMentorId())
                .learnerId(request.getLearnerId())
                .sessionDate(request.getSessionDate())
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
        return repository.findByLearnerIdOrMentorId(userId, userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<SessionResponse> getMentorSessions(Long mentorId) {
        return repository.findByMentorId(mentorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
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
                .createdAt(session.getCreatedAt())
                .build();
    }
}
