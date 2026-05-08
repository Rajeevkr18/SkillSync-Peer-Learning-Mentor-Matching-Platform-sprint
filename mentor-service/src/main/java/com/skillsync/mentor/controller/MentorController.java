package com.skillsync.mentor.controller;

import com.skillsync.mentor.dto.*;
import com.skillsync.mentor.service.MentorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/mentors")
@RequiredArgsConstructor
public class MentorController {


    private final MentorService mentorService;

    @PostMapping("/apply")
    public ResponseEntity<MentorResponse> applyAsMentor(@Valid @RequestBody MentorApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mentorService.applyAsMentor(request));
    }


    @GetMapping
    public ResponseEntity<List<MentorResponse>> getMentors(
            @RequestParam(name = "skill", required = false) String skill,
            @RequestParam(name = "minRating", required = false) Double minRating,
            @RequestParam(name = "maxPrice", required = false) Double maxPrice,
            @RequestParam(name = "available", required = false) Boolean available,
            @RequestParam(name = "minExperience", required = false) Integer minExperience) {
        if (skill != null || minRating != null || maxPrice != null || available != null || minExperience != null) {
            return ResponseEntity.ok(mentorService.searchMentors(skill, minRating, maxPrice, available, minExperience));
        }
        return ResponseEntity.ok(mentorService.getAllApprovedMentors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MentorResponse> getMentorById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(mentorService.getMentorById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<MentorResponse> getMentorByUserId(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(mentorService.getMentorByUserId(userId));
    }

    private final com.skillsync.mentor.service.RecommendationService recommendationService;

    @PostMapping("/recommendations")
    public ResponseEntity<List<MentorResponse>> getRecommendations(@RequestBody List<String> skills) {
        return ResponseEntity.ok(recommendationService.recommendMentors(skills));
    }

    @PutMapping("/{id}/availability")
    public ResponseEntity<MentorResponse> updateAvailability(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(mentorService.updateAvailability(id, body.get("available")));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<MentorResponse> approveMentor(@PathVariable("id") Long id) {
        return ResponseEntity.ok(mentorService.approveMentor(id));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<MentorResponse>> getPendingMentors() {
        return ResponseEntity.ok(mentorService.getPendingMentors());
    }

    @PostMapping("/{id}/slots")
    public ResponseEntity<MentorAvailabilityResponse> addAvailabilitySlot(
            @PathVariable("id") Long id,
            @RequestBody MentorAvailabilityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mentorService.addAvailability(id, request));
    }

    @GetMapping("/{id}/slots")
    public ResponseEntity<List<MentorAvailabilityResponse>> getAvailabilitySlots(@PathVariable("id") Long id) {
        return ResponseEntity.ok(mentorService.getAvailability(id));
    }

    @GetMapping("/{id}/slots/available")
    public ResponseEntity<List<MentorAvailabilityResponse>> getAvailableSlots(@PathVariable("id") Long id) {
        return ResponseEntity.ok(mentorService.getAvailableSlots(id));
    }

    @PutMapping("/slots/{slotId}/book")
    public ResponseEntity<Void> markSlotAsBooked(@PathVariable("slotId") Long slotId) {
        mentorService.markSlotAsBooked(slotId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/slots/{slotId}")
    public ResponseEntity<Void> deleteAvailabilitySlot(@PathVariable("slotId") Long slotId) {
        mentorService.deleteAvailabilitySlot(slotId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/slots/{slotId}")
    public ResponseEntity<MentorAvailabilityResponse> updateAvailabilitySlot(
            @PathVariable("slotId") Long slotId,
            @RequestBody MentorAvailabilityRequest request) {
        return ResponseEntity.ok(mentorService.updateAvailabilitySlot(slotId, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMentor(@PathVariable("id") Long id) {
        mentorService.deleteMentor(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/rating")
    public ResponseEntity<Void> updateMentorRating(
            @PathVariable("id") Long id,
            @RequestParam(name = "rating") Double rating) {
        mentorService.updateMentorRating(id, rating);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<MentorResponse> updateMentor(
            @PathVariable("id") Long id,
            @Valid @RequestBody MentorApplicationRequest request) {
        return ResponseEntity.ok(mentorService.updateMentor(id, request));
    }
}
