package com.skillsync.skill.repository;

import com.skillsync.skill.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SkillRepository extends JpaRepository<Skill, Long> {
    List<Skill> findByCategory(String category);
    boolean existsByName(String name);
}
