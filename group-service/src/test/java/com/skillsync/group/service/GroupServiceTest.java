package com.skillsync.group.service;

import com.skillsync.group.dto.GroupRequest;
import com.skillsync.group.dto.GroupResponse;
import com.skillsync.group.entity.GroupMember;
import com.skillsync.group.entity.LearningGroup;
import com.skillsync.group.repository.GroupMemberRepository;
import com.skillsync.group.repository.GroupRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GroupServiceTest {

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private GroupMemberRepository memberRepository;

    @InjectMocks
    private GroupService groupService;

    private LearningGroup group;

    @BeforeEach
    void setUp() {
        group = LearningGroup.builder()
                .id(1L)
                .name("Java Learners")
                .description("Group for Java learners")
                .skills("Java,Spring")
                .createdBy(100L)
                .members(new ArrayList<>())
                .build();
    }

    @Test
    void createGroup_ShouldSaveGroupAndAddCreatorAsMember() {
        GroupRequest request = GroupRequest.builder()
                .name("Java Learners")
                .description("Group for Java learners")
                .skills("Java,Spring")
                .createdBy(100L)
                .build();

        when(groupRepository.save(any(LearningGroup.class))).thenReturn(group);
        when(memberRepository.save(any(GroupMember.class))).thenReturn(null);
        when(groupRepository.findById(1L)).thenReturn(Optional.of(group));

        GroupResponse response = groupService.createGroup(request);

        assertNotNull(response);
        assertEquals("Java Learners", response.getName());
        verify(groupRepository, times(1)).save(any(LearningGroup.class));
        verify(memberRepository, times(1)).save(any(GroupMember.class));
    }

    @Test
    void joinGroup_ShouldAddMember_WhenNotAlreadyMember() {
        when(groupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(memberRepository.existsByGroupIdAndUserId(1L, 200L)).thenReturn(false);
        when(memberRepository.save(any(GroupMember.class))).thenReturn(null);
        when(groupRepository.findById(1L)).thenReturn(Optional.of(group));

        GroupResponse response = groupService.joinGroup(1L, 200L);

        assertNotNull(response);
        verify(memberRepository).save(any(GroupMember.class));
    }

    @Test
    void joinGroup_ShouldThrowException_WhenAlreadyMember() {
        when(groupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(memberRepository.existsByGroupIdAndUserId(1L, 200L)).thenReturn(true);

        assertThrows(RuntimeException.class, () -> groupService.joinGroup(1L, 200L));
        verify(memberRepository, never()).save(any());
    }

    @Test
    void getGroupById_ShouldReturnGroup_WhenIdExists() {
        when(groupRepository.findById(1L)).thenReturn(Optional.of(group));

        GroupResponse response = groupService.getGroupById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
    }

    @Test
    void getGroupById_ShouldThrow_WhenGroupNotFound() {
        when(groupRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> groupService.getGroupById(99L));
    }

    @Test
    void getAllGroups_ShouldReturnAllGroups() {
        when(groupRepository.findAll()).thenReturn(List.of(group));

        List<GroupResponse> result = groupService.getAllGroups();

        assertEquals(1, result.size());
    }
}
