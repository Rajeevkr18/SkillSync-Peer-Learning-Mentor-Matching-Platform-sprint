package com.skillsync.review.service;

import com.skillsync.review.dto.*;
import com.skillsync.review.entity.Review;
import com.skillsync.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository repository;
    private final org.springframework.web.client.RestTemplate restTemplate;

    public Review submitReview(ReviewRequest request) {
        Review review = Review.builder()
                .mentorId(request.getMentorId())
                .reviewerId(request.getReviewerId())
                .sessionId(request.getSessionId())
                .rating(request.getRating())
                .comment(request.getComment())
                .build();
        review = repository.saveAndFlush(review);
        System.out.println("DEBUG: Review saved with ID: " + review.getId());

        // Update mentor's overall rating in mentor-service
        try {
            Double avgRating = repository.getAverageRatingByMentorId(request.getMentorId());
            System.out.println("DEBUG: Calculated average rating for mentor " + request.getMentorId() + ": " + avgRating);
            
            if (avgRating != null) {
                // Use UriComponentsBuilder to safely build the URL
                String url = org.springframework.web.util.UriComponentsBuilder
                        .fromHttpUrl("http://mentor-service/mentors/" + request.getMentorId() + "/rating")
                        .queryParam("rating", avgRating)
                        .toUriString();
                
                System.out.println("DEBUG: Calling mentor-service URL: " + url);
                restTemplate.put(url, null);
                System.out.println("DEBUG: Successfully called mentor-service to update rating.");
            }
        } catch (Exception e) {
            System.err.println("ERROR: Failed to update mentor rating in mentor-service: " + e.getMessage());
            e.printStackTrace();
        }

        return review;
    }

    public MentorReviewsResponse getMentorReviews(Long mentorId) {
        List<Review> reviews = repository.findByMentorId(mentorId);
        Double avgRating = repository.getAverageRatingByMentorId(mentorId);
        Long totalReviews = repository.getReviewCountByMentorId(mentorId);

        List<MentorReviewsResponse.ReviewInfo> reviewInfos = reviews.stream()
                .map(r -> MentorReviewsResponse.ReviewInfo.builder()
                        .id(r.getId())
                        .reviewerId(r.getReviewerId())
                        .rating(r.getRating())
                        .comment(r.getComment())
                        .createdAt(r.getCreatedAt().toString())
                        .build())
                .collect(Collectors.toList());

        return MentorReviewsResponse.builder()
                .mentorId(mentorId)
                .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                .totalReviews(totalReviews)
                .reviews(reviewInfos)
                .build();
    }
}
