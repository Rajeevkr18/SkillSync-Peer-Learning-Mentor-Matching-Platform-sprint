package com.skillsync.session.service;

import com.skillsync.session.dto.SessionRequest;
import com.skillsync.session.dto.SessionResponse;
import com.skillsync.session.entity.MentoringSession;
import com.skillsync.session.entity.SessionStatus;
import com.skillsync.session.repository.SessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    @Mock
    private SessionRepository repository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private SessionService sessionService;

    private MentoringSession session;

    @BeforeEach
    void setUp() {
        // Inject @Value fields since Spring context is not loaded
        ReflectionTestUtils.setField(sessionService, "exchange", "skillsync.exchange");
        ReflectionTestUtils.setField(sessionService, "sessionBookedRoutingKey", "session.booked");
        ReflectionTestUtils.setField(sessionService, "sessionAcceptedRoutingKey", "session.accepted");

        session = MentoringSession.builder()
                .id(1L)
                .mentorId(10L)
                .learnerId(20L)
                .sessionDate(LocalDateTime.now().plusDays(1))
                .duration(60)
                .topic("Spring Boot")
                .status(SessionStatus.REQUESTED)
                .build();
    }

    @Test
    void bookSession_ShouldSaveAndReturnSession() {
        SessionRequest request = SessionRequest.builder()
                .mentorId(10L)
                .learnerId(20L)
                .sessionDate(LocalDateTime.now().plusDays(1))
                .duration(60)
                .topic("Spring Boot")
                .build();

        when(repository.save(any(MentoringSession.class))).thenReturn(session);

        SessionResponse response = sessionService.bookSession(request);

        assertNotNull(response);
        assertEquals("Spring Boot", response.getTopic());
        assertEquals(10L, response.getMentorId());
        verify(repository).save(any(MentoringSession.class));
    }

    @Test
    void acceptSession_ShouldSetStatusToAccepted() {
        when(repository.findById(1L)).thenReturn(Optional.of(session));
        when(repository.save(any(MentoringSession.class))).thenAnswer(inv -> {
            MentoringSession s = inv.getArgument(0);
            return s;
        });

        SessionResponse response = sessionService.acceptSession(1L);

        assertNotNull(response);
        assertEquals("ACCEPTED", response.getStatus());
    }

    @Test
    void rejectSession_ShouldSetStatusToRejected() {
        when(repository.findById(1L)).thenReturn(Optional.of(session));
        when(repository.save(any(MentoringSession.class))).thenAnswer(inv -> inv.getArgument(0));

        SessionResponse response = sessionService.rejectSession(1L);

        assertEquals("REJECTED", response.getStatus());
    }

    @Test
    void cancelSession_ShouldSetStatusToCancelled() {
        when(repository.findById(1L)).thenReturn(Optional.of(session));
        when(repository.save(any(MentoringSession.class))).thenAnswer(inv -> inv.getArgument(0));

        SessionResponse response = sessionService.cancelSession(1L);

        assertEquals("CANCELLED", response.getStatus());
    }

    @Test
    void completeSession_ShouldSetStatusToCompleted() {
        when(repository.findById(1L)).thenReturn(Optional.of(session));
        when(repository.save(any(MentoringSession.class))).thenAnswer(inv -> inv.getArgument(0));

        SessionResponse response = sessionService.completeSession(1L);

        assertEquals("COMPLETED", response.getStatus());
    }

    @Test
    void acceptSession_ShouldThrow_WhenSessionNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> sessionService.acceptSession(99L));
    }

    @Test
    void getUserSessions_ShouldReturnSessionsForUser() {
        when(repository.findByLearnerIdOrMentorId(20L, 20L)).thenReturn(List.of(session));

        List<SessionResponse> result = sessionService.getUserSessions(20L);

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }
}
