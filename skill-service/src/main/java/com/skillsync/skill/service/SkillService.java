package com.skillsync.skill.service;

import com.skillsync.skill.entity.Skill;
import com.skillsync.skill.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillRepository repository;

    public Skill createSkill(Skill skill) {
        if (repository.existsByName(skill.getName())) {
            throw new RuntimeException("Skill already exists: " + skill.getName());
        }
        return repository.save(skill);
    }

    public List<Skill> getAllSkills() {
        return repository.findAll();
    }

    public Skill getSkillById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Skill not found: " + id));
    }

    public List<Skill> getSkillsByCategory(String category) {
        return repository.findByCategory(category);
    }

    public void deleteSkill(Long id) {
        repository.deleteById(id);
    }
}
