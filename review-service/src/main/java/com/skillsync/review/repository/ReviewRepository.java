package com.skillsync.review.repository;

import com.skillsync.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByMentorId(Long mentorId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.mentorId = :mentorId")
    Double getAverageRatingByMentorId(@Param("mentorId") Long mentorId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.mentorId = :mentorId")
    Long getReviewCountByMentorId(@Param("mentorId") Long mentorId);
}
