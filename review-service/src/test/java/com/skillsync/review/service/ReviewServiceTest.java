package com.skillsync.review.service;

import com.skillsync.review.dto.MentorReviewsResponse;
import com.skillsync.review.dto.ReviewRequest;
import com.skillsync.review.entity.Review;
import com.skillsync.review.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository repository;

    @InjectMocks
    private ReviewService reviewService;

    private Review review;
    private ReviewRequest request;

    @BeforeEach
    void setUp() {
        review = Review.builder()
                .id(1L)
                .mentorId(10L)
                .reviewerId(20L)
                .sessionId(5L)
                .rating(5)
                .comment("Excellent mentor!")
                .createdAt(LocalDateTime.now())
                .build();

        request = ReviewRequest.builder()
                .mentorId(10L)
                .reviewerId(20L)
                .sessionId(5L)
                .rating(5)
                .comment("Excellent mentor!")
                .build();
    }

    @Test
    void submitReview_ShouldSaveAndReturnReview() {
        when(repository.save(any(Review.class))).thenReturn(review);

        Review result = reviewService.submitReview(request);

        assertNotNull(result);
        assertEquals(10L, result.getMentorId());
        assertEquals(5, result.getRating());
        assertEquals("Excellent mentor!", result.getComment());
        verify(repository).save(any(Review.class));
    }

    @Test
    void getMentorReviews_ShouldReturnAggregatedReviews() {
        when(repository.findByMentorId(10L)).thenReturn(List.of(review));
        when(repository.getAverageRatingByMentorId(10L)).thenReturn(5.0);
        when(repository.getReviewCountByMentorId(10L)).thenReturn(1L);

        MentorReviewsResponse response = reviewService.getMentorReviews(10L);

        assertNotNull(response);
        assertEquals(10L, response.getMentorId());
        assertEquals(5.0, response.getAverageRating());
        assertEquals(1L, response.getTotalReviews());
        assertFalse(response.getReviews().isEmpty());
    }

    @Test
    void getMentorReviews_ShouldReturnZeroRating_WhenNoReviews() {
        when(repository.findByMentorId(99L)).thenReturn(List.of());
        when(repository.getAverageRatingByMentorId(99L)).thenReturn(null);
        when(repository.getReviewCountByMentorId(99L)).thenReturn(0L);

        MentorReviewsResponse response = reviewService.getMentorReviews(99L);

        assertEquals(0.0, response.getAverageRating());
        assertEquals(0L, response.getTotalReviews());
        assertTrue(response.getReviews().isEmpty());
    }
}
