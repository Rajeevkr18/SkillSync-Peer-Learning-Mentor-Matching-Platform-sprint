package com.skillsync.group.repository;

import com.skillsync.group.entity.LearningGroup;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupRepository extends JpaRepository<LearningGroup, Long> {
}
