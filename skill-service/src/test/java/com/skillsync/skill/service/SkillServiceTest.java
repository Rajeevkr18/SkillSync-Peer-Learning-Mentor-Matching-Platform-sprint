package com.skillsync.skill.service;

import com.skillsync.skill.entity.Skill;
import com.skillsync.skill.repository.SkillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SkillServiceTest {

    @Mock
    private SkillRepository repository;

    @InjectMocks
    private SkillService skillService;

    private Skill skill;

    @BeforeEach
    void setUp() {
        skill = Skill.builder()
                .id(1L)
                .name("Java")
                .category("Programming")
                .build();
    }

    @Test
    void createSkill_ShouldSaveSkill_WhenNameIsUnique() {
        when(repository.existsByName("Java")).thenReturn(false);
        when(repository.save(any(Skill.class))).thenReturn(skill);

        Skill result = skillService.createSkill(skill);

        assertNotNull(result);
        assertEquals("Java", result.getName());
        verify(repository).save(skill);
    }

    @Test
    void createSkill_ShouldThrowException_WhenSkillAlreadyExists() {
        when(repository.existsByName("Java")).thenReturn(true);

        assertThrows(RuntimeException.class, () -> skillService.createSkill(skill));
        verify(repository, never()).save(any());
    }

    @Test
    void getSkillById_ShouldReturnSkill_WhenIdExists() {
        when(repository.findById(1L)).thenReturn(Optional.of(skill));

        Skill result = skillService.getSkillById(1L);

        assertNotNull(result);
        assertEquals("Java", result.getName());
    }

    @Test
    void getSkillById_ShouldThrowException_WhenIdNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> skillService.getSkillById(99L));
    }

    @Test
    void getAllSkills_ShouldReturnList() {
        when(repository.findAll()).thenReturn(List.of(skill));

        List<Skill> result = skillService.getAllSkills();

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }

    @Test
    void getSkillsByCategory_ShouldFilterByCategory() {
        when(repository.findByCategory("Programming")).thenReturn(List.of(skill));

        List<Skill> result = skillService.getSkillsByCategory("Programming");

        assertEquals(1, result.size());
        assertEquals("Programming", result.get(0).getCategory());
    }

    @Test
    void deleteSkill_ShouldCallRepository() {
        doNothing().when(repository).deleteById(1L);

        skillService.deleteSkill(1L);

        verify(repository, times(1)).deleteById(1L);
    }
}
