package com.skillsync.mentor.service;

import com.skillsync.mentor.dto.MentorApplicationRequest;
import com.skillsync.mentor.dto.MentorResponse;
import com.skillsync.mentor.entity.Mentor;
import com.skillsync.mentor.repository.MentorRepository;
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
class MentorServiceTest {

    @Mock
    private MentorRepository repository;

    @InjectMocks
    private MentorService mentorService;

    private Mentor mentor;
    private MentorApplicationRequest request;

    @BeforeEach
    void setUp() {
        mentor = Mentor.builder()
                .id(1L)
                .userId(200L)
                .name("Alice Smith")
                .bio("Experienced Java developer")
                .experience(5)
                .hourlyRate(50.0)
                .skills(List.of("Java", "Spring"))
                .approved(false)
                .available(true)
                .build();

        request = MentorApplicationRequest.builder()
                .userId(200L)
                .name("Alice Smith")
                .bio("Experienced Java developer")
                .experience(5)
                .hourlyRate(50.0)
                .skills(List.of("Java", "Spring"))
                .build();
    }

    @Test
    void applyAsMentor_ShouldSaveMentor_WhenUserIsNew() {
        when(repository.existsByUserId(200L)).thenReturn(false);
        when(repository.save(any(Mentor.class))).thenReturn(mentor);

        MentorResponse response = mentorService.applyAsMentor(request);

        assertNotNull(response);
        assertEquals("Alice Smith", response.getName());
        assertEquals(200L, response.getUserId());
        verify(repository).save(any(Mentor.class));
    }

    @Test
    void applyAsMentor_ShouldThrowException_WhenUserAlreadyApplied() {
        when(repository.existsByUserId(200L)).thenReturn(true);

        assertThrows(RuntimeException.class, () -> mentorService.applyAsMentor(request));
        verify(repository, never()).save(any());
    }

    @Test
    void getMentorById_ShouldReturnMentor_WhenIdExists() {
        when(repository.findById(1L)).thenReturn(Optional.of(mentor));

        MentorResponse response = mentorService.getMentorById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
    }

    @Test
    void getMentorById_ShouldThrowException_WhenIdNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> mentorService.getMentorById(99L));
    }

    @Test
    void approveMentor_ShouldSetApprovedTrue() {
        when(repository.findById(1L)).thenReturn(Optional.of(mentor));
        when(repository.save(any(Mentor.class))).thenAnswer(inv -> inv.getArgument(0));

        MentorResponse response = mentorService.approveMentor(1L);

        assertNotNull(response);
        assertTrue(response.getApproved());
        verify(repository).save(any(Mentor.class));
    }

    @Test
    void getAllApprovedMentors_ShouldReturnApprovedList() {
        mentor.setApproved(true);
        when(repository.findByApprovedTrue()).thenReturn(List.of(mentor));

        List<MentorResponse> result = mentorService.getAllApprovedMentors();

        assertFalse(result.isEmpty());
        assertTrue(result.get(0).getApproved());
    }
}
