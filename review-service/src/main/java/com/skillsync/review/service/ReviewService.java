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

    public Review submitReview(ReviewRequest request) {
        Review review = Review.builder()
                .mentorId(request.getMentorId())
                .reviewerId(request.getReviewerId())
                .sessionId(request.getSessionId())
                .rating(request.getRating())
                .comment(request.getComment())
                .build();
        return repository.save(review);
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
