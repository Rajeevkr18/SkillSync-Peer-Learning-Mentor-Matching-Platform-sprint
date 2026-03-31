package com.skillsync.review.controller;

import com.skillsync.review.dto.*;
import com.skillsync.review.entity.Review;
import com.skillsync.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<Review> submitReview(@Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.submitReview(request));
    }

    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<MentorReviewsResponse> getMentorReviews(@PathVariable Long mentorId) {
        return ResponseEntity.ok(reviewService.getMentorReviews(mentorId));
    }
}
