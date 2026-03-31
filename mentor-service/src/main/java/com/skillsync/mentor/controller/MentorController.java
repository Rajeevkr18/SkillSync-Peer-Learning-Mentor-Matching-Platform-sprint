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
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Boolean available) {
        if (skill != null || minRating != null || maxPrice != null || available != null) {
            return ResponseEntity.ok(mentorService.searchMentors(skill, minRating, maxPrice, available));
        }
        return ResponseEntity.ok(mentorService.getAllApprovedMentors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MentorResponse> getMentorById(@PathVariable Long id) {
        return ResponseEntity.ok(mentorService.getMentorById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<MentorResponse> getMentorByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(mentorService.getMentorByUserId(userId));
    }

    @PutMapping("/{id}/availability")
    public ResponseEntity<MentorResponse> updateAvailability(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(mentorService.updateAvailability(id, body.get("available")));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<MentorResponse> approveMentor(@PathVariable Long id) {
        return ResponseEntity.ok(mentorService.approveMentor(id));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<MentorResponse>> getPendingMentors() {
        return ResponseEntity.ok(mentorService.getPendingMentors());
    }
}
