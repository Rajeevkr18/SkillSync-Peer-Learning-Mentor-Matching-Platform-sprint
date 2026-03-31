package com.skillsync.review.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorReviewsResponse {
    private Long mentorId;
    private Double averageRating;
    private Long totalReviews;
    private List<ReviewInfo> reviews;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewInfo {
        private Long id;
        private Long reviewerId;

        private Integer rating;
        private String comment;
        private String createdAt;
    }
}
