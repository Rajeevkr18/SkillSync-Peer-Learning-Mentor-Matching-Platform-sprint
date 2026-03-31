package com.skillsync.user.service;

import com.skillsync.user.dto.UserProfileRequest;
import com.skillsync.user.dto.UserProfileResponse;
import com.skillsync.user.entity.UserProfile;
import com.skillsync.user.repository.UserProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserProfileRepository repository;

    @InjectMocks
    private UserService userService;

    private UserProfile profile;
    private UserProfileRequest request;

    @BeforeEach
    void setUp() {
        profile = UserProfile.builder()
                .id(1L)
                .userId(100L)
                .name("John Doe")
                .email("john@example.com")
                .build();

        request = UserProfileRequest.builder()
                .userId(100L)
                .name("John Doe")
                .email("john@example.com")
                .build();
    }

    @Test
    void getProfile_ShouldReturnProfile_WhenIdExists() {
        // Arrange
        when(repository.findByUserId(100L)).thenReturn(Optional.of(profile));

        // Act
        UserProfileResponse response = userService.getProfile(100L);

        // Assert
        assertNotNull(response);
        assertEquals("John Doe", response.getName());
        verify(repository, times(1)).findByUserId(100L);
    }

    @Test
    void getProfile_ShouldThrowException_WhenIdDoesNotExist() {
        // Arrange
        when(repository.findByUserId(100L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> userService.getProfile(100L));
    }

    @Test
    void createProfile_ShouldSaveProfile_WhenUserIdIsNew() {
        // Arrange
        when(repository.existsByUserId(100L)).thenReturn(false);
        when(repository.save(any(UserProfile.class))).thenReturn(profile);

        // Act
        UserProfileResponse response = userService.createProfile(request);

        // Assert
        assertNotNull(response);
        assertEquals(100L, response.getUserId());
        verify(repository).save(any(UserProfile.class));
    }
}
