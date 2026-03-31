package com.skillsync.user.service;

import com.skillsync.user.dto.*;
import com.skillsync.user.entity.UserProfile;
import com.skillsync.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserProfileRepository repository;

    public UserProfileResponse createProfile(UserProfileRequest request) {
        if (repository.existsByUserId(request.getUserId())) {
            throw new RuntimeException("Profile already exists for user: " + request.getUserId());
        }
        UserProfile profile = UserProfile.builder()
                .userId(request.getUserId())
                .name(request.getName())
                .email(request.getEmail())
                .bio(request.getBio())
                .skills(request.getSkills())
                .profileImage(request.getProfileImage())
                .phone(request.getPhone())
                .location(request.getLocation())
                .build();
        return mapToResponse(repository.save(profile));
    }

    public UserProfileResponse getProfile(Long userId) {
        UserProfile profile = repository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found for user: " + userId));
        return mapToResponse(profile);
    }

    public UserProfileResponse updateProfile(Long userId, UserProfileRequest request) {
        UserProfile profile = repository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found for user: " + userId));
        profile.setName(request.getName());
        profile.setEmail(request.getEmail());
        profile.setBio(request.getBio());
        profile.setSkills(request.getSkills());
        profile.setProfileImage(request.getProfileImage());
        profile.setPhone(request.getPhone());
        profile.setLocation(request.getLocation());
        profile.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(repository.save(profile));
    }

    public List<UserProfileResponse> getAllProfiles() {
        return repository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private UserProfileResponse mapToResponse(UserProfile profile) {
        return UserProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUserId())
                .name(profile.getName())
                .email(profile.getEmail())
                .bio(profile.getBio())
                .skills(profile.getSkills())
                .profileImage(profile.getProfileImage())
                .phone(profile.getPhone())
                .location(profile.getLocation())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}
