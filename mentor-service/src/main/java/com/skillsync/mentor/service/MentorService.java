package com.skillsync.mentor.service;

import com.skillsync.mentor.dto.*;
import com.skillsync.mentor.entity.Mentor;
import com.skillsync.mentor.repository.MentorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MentorService {

    private final MentorRepository repository;
    private final com.skillsync.mentor.repository.MentorAvailabilityRepository availabilityRepository;
    private final RestTemplate restTemplate;

    public MentorAvailabilityResponse addAvailability(Long mentorId, MentorAvailabilityRequest request) {
        com.skillsync.mentor.entity.MentorAvailability availability = com.skillsync.mentor.entity.MentorAvailability.builder()
                .mentorId(mentorId)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .isBooked(false)
                .build();
        return mapToAvailabilityResponse(availabilityRepository.save(availability));
    }

    public List<MentorAvailabilityResponse> getAvailability(Long mentorId) {
        return availabilityRepository.findByMentorId(mentorId).stream()
                .map(this::mapToAvailabilityResponse)
                .collect(Collectors.toList());
    }

    public List<MentorAvailabilityResponse> getAvailableSlots(Long mentorId) {
        return availabilityRepository.findByMentorIdAndIsBookedFalse(mentorId).stream()
                .map(this::mapToAvailabilityResponse)
                .collect(Collectors.toList());
    }

    public void markSlotAsBooked(Long slotId) {
        com.skillsync.mentor.entity.MentorAvailability availability = availabilityRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found: " + slotId));
        availability.setIsBooked(true);
        availabilityRepository.save(availability);
    }

    public void deleteAvailabilitySlot(Long slotId) {
        com.skillsync.mentor.entity.MentorAvailability availability = availabilityRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found: " + slotId));
        if (availability.getIsBooked()) {
            throw new RuntimeException("Cannot delete a booked slot");
        }
        availabilityRepository.delete(availability);
    }

    public MentorAvailabilityResponse updateAvailabilitySlot(Long slotId, MentorAvailabilityRequest request) {
        com.skillsync.mentor.entity.MentorAvailability availability = availabilityRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found: " + slotId));
        if (availability.getIsBooked()) {
            throw new RuntimeException("Cannot edit a booked slot");
        }
        availability.setStartTime(request.getStartTime());
        availability.setEndTime(request.getEndTime());
        return mapToAvailabilityResponse(availabilityRepository.save(availability));
    }

    private MentorAvailabilityResponse mapToAvailabilityResponse(com.skillsync.mentor.entity.MentorAvailability availability) {
        return MentorAvailabilityResponse.builder()
                .id(availability.getId())
                .mentorId(availability.getMentorId())
                .startTime(availability.getStartTime())
                .endTime(availability.getEndTime())
                .isBooked(availability.getIsBooked())
                .build();
    }

    public MentorResponse applyAsMentor(MentorApplicationRequest request) {
        if (repository.existsByUserId(request.getUserId())) {
            throw new RuntimeException("You have already submitted a mentor application. Please wait for admin approval.");
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

    public List<MentorResponse> searchMentors(String skill, Double minRating, Double maxPrice, Boolean available, Integer minExp) {
        return repository.searchMentors(skill, minRating, maxPrice, available, minExp).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public MentorResponse getMentorById(Long id) {
        Mentor mentor = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mentor not found: " + id));
        return mapToResponse(mentor);
    }

    public MentorResponse getMentorByUserId(Long userId) {
        return repository.findByUserId(userId)
                .map(this::mapToResponse)
                .orElse(null);
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
        mentor = repository.save(mentor);

        // Update user role in auth-service
        try {
            String authServiceUrl = "http://auth-service/auth/users/" + mentor.getUserId() + "/role?role=ROLE_MENTOR";
            System.out.println("Updating user role to ROLE_MENTOR in auth-service: " + authServiceUrl);
            org.springframework.http.ResponseEntity<Void> response = restTemplate.exchange(
                authServiceUrl,
                org.springframework.http.HttpMethod.PUT,
                null,
                Void.class
            );
            System.out.println("Auth-service role update response status: " + response.getStatusCode());
        } catch (Exception e) {
            System.err.println("CRITICAL: Failed to update user role in auth-service for user " + mentor.getUserId() + ": " + e.getMessage());
        }

        // Update user-service profile with mentor bio and skills
        try {
            String userServiceUrl = "http://user-service/users/" + mentor.getUserId();
            // Fetch current profile to keep name and email
            Map<String, Object> currentProfile = restTemplate.getForObject(userServiceUrl, Map.class);
            if (currentProfile != null) {
                currentProfile.put("bio", mentor.getBio());
                // Skills in UserProfile is String, in Mentor is List<String>
                String skillsStr = mentor.getSkills() != null ? String.join(", ", mentor.getSkills()) : "";
                currentProfile.put("skills", skillsStr);
                restTemplate.put(userServiceUrl, currentProfile);
            }
        } catch (Exception e) {
            System.err.println("Failed to update user-service profile: " + e.getMessage());
        }

        return mapToResponse(mentor);
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

    public void deleteMentor(Long id) {
        Mentor mentor = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mentor not found: " + id));
        
        // Revert user role to ROLE_LEARNER in auth-service
        try {
            String authServiceUrl = "http://auth-service/auth/users/" + mentor.getUserId() + "/role?role=ROLE_LEARNER";
            restTemplate.exchange(authServiceUrl, org.springframework.http.HttpMethod.PUT, null, Void.class);
        } catch (Exception e) {
            System.err.println("Failed to revert user role: " + e.getMessage());
        }

        availabilityRepository.deleteByMentorId(mentor.getId());
        repository.delete(mentor);
    }

    public MentorResponse updateMentor(Long id, MentorApplicationRequest request) {
        Mentor mentor = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mentor not found: " + id));
        
        mentor.setBio(request.getBio());
        mentor.setSkills(request.getSkills());
        mentor.setHourlyRate(request.getHourlyRate());
        mentor.setExperience(request.getExperience());
        mentor.setName(request.getName());
        
        return mapToResponse(repository.save(mentor));
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
