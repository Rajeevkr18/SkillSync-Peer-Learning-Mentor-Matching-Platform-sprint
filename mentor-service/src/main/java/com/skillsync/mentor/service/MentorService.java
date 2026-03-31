package com.skillsync.mentor.service;

import com.skillsync.mentor.dto.*;
import com.skillsync.mentor.entity.Mentor;
import com.skillsync.mentor.repository.MentorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MentorService {

    private final MentorRepository repository;

    public MentorResponse applyAsMentor(MentorApplicationRequest request) {
        if (repository.existsByUserId(request.getUserId())) {
            throw new RuntimeException("Mentor application already exists for user: " + request.getUserId());
        }
        Mentor mentor = Mentor.builder()
                .userId(request.getUserId())
                .name(request.getName())
                .bio(request.getBio())
                .experience(request.getExperience())
                .hourlyRate(request.getHourlyRate())
                .skills(request.getSkills())
                .approved(false)
                .available(true)
                .build();
        return mapToResponse(repository.save(mentor));
    }

    public List<MentorResponse> getAllApprovedMentors() {
        return repository.findByApprovedTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<MentorResponse> searchMentors(String skill, Double minRating, Double maxPrice, Boolean available) {
        return repository.searchMentors(skill, minRating, maxPrice, available).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public MentorResponse getMentorById(Long id) {
        Mentor mentor = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mentor not found: " + id));
        return mapToResponse(mentor);
    }

    public MentorResponse getMentorByUserId(Long userId) {
        Mentor mentor = repository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Mentor not found for user: " + userId));
        return mapToResponse(mentor);
    }

    public MentorResponse updateAvailability(Long id, Boolean available) {
        Mentor mentor = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mentor not found: " + id));
        mentor.setAvailable(available);
        return mapToResponse(repository.save(mentor));
    }

    public MentorResponse approveMentor(Long id) {
        Mentor mentor = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mentor not found: " + id));
        mentor.setApproved(true);
        return mapToResponse(repository.save(mentor));
    }

    public void updateMentorRating(Long id, Double newRating) {
        Mentor mentor = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mentor not found: " + id));
        mentor.setRating(newRating);
        repository.save(mentor);
    }

    public List<MentorResponse> getPendingMentors() {
        return repository.findAll().stream()
                .filter(m -> !m.getApproved())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private MentorResponse mapToResponse(Mentor mentor) {
        return MentorResponse.builder()
                .id(mentor.getId())
                .userId(mentor.getUserId())
                .name(mentor.getName())
                .bio(mentor.getBio())
                .experience(mentor.getExperience())
                .rating(mentor.getRating())
                .hourlyRate(mentor.getHourlyRate())
                .skills(mentor.getSkills())
                .available(mentor.getAvailable())
                .approved(mentor.getApproved())
                .createdAt(mentor.getCreatedAt())
                .build();
    }
}
