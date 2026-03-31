package com.skillsync.session.repository;

import com.skillsync.session.entity.MentoringSession;
import com.skillsync.session.entity.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SessionRepository extends JpaRepository<MentoringSession, Long> {
    List<MentoringSession> findByLearnerId(Long learnerId);
    List<MentoringSession> findByMentorId(Long mentorId);
    List<MentoringSession> findByLearnerIdOrMentorId(Long learnerId, Long mentorId);
    List<MentoringSession> findByStatus(SessionStatus status);
}
