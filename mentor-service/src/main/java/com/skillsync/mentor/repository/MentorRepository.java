package com.skillsync.mentor.repository;

import com.skillsync.mentor.entity.Mentor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MentorRepository extends JpaRepository<Mentor, Long> {
    Optional<Mentor> findByUserId(Long userId);
    boolean existsByUserId(Long userId);

    List<Mentor> findByApprovedTrue();

    @Query("SELECT m FROM Mentor m WHERE m.approved = true " +
           "AND (:skill IS NULL OR m.skills LIKE %:skill%) " +
           "AND (:minRating IS NULL OR m.rating >= :minRating) " +
           "AND (:maxPrice IS NULL OR m.hourlyRate <= :maxPrice) " +
           "AND (:available IS NULL OR m.available = :available)")
    List<Mentor> searchMentors(
            @Param("skill") String skill,
            @Param("minRating") Double minRating,
            @Param("maxPrice") Double maxPrice,
            @Param("available") Boolean available
    );
}
