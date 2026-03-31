package com.skillsync.notification.service;

import com.skillsync.notification.entity.Notification;
import com.skillsync.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository repository;

    @InjectMocks
    private NotificationService notificationService;

    private Notification notification;

    @BeforeEach
    void setUp() {
        notification = Notification.builder()
                .id(1L)
                .userId(300L)
                .message("Your session has been booked!")
                .type("SESSION_BOOKED")
                .isRead(false)
                .build();
    }

    @Test
    void createNotification_ShouldSaveAndReturn() {
        when(repository.save(any(Notification.class))).thenReturn(notification);

        Notification result = notificationService.createNotification(300L, "Your session has been booked!", "SESSION_BOOKED");

        assertNotNull(result);
        assertEquals(300L, result.getUserId());
        assertEquals("SESSION_BOOKED", result.getType());
        assertFalse(result.getIsRead());
        verify(repository).save(any(Notification.class));
    }

    @Test
    void getUserNotifications_ShouldReturnAllForUser() {
        when(repository.findByUserIdOrderByCreatedAtDesc(300L)).thenReturn(List.of(notification));

        List<Notification> result = notificationService.getUserNotifications(300L);

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }

    @Test
    void getUnreadNotifications_ShouldReturnOnlyUnread() {
        when(repository.findByUserIdAndIsReadFalse(300L)).thenReturn(List.of(notification));

        List<Notification> result = notificationService.getUnreadNotifications(300L);

        assertEquals(1, result.size());
        assertFalse(result.get(0).getIsRead());
    }

    @Test
    void markAsRead_ShouldSetIsReadTrue() {
        when(repository.findById(1L)).thenReturn(Optional.of(notification));
        when(repository.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

        Notification result = notificationService.markAsRead(1L);

        assertTrue(result.getIsRead());
        verify(repository).save(any(Notification.class));
    }

    @Test
    void markAsRead_ShouldThrow_WhenNotificationNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> notificationService.markAsRead(99L));
    }
}
