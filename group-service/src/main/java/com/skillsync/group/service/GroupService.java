package com.skillsync.group.service;

import com.skillsync.group.dto.*;
import com.skillsync.group.entity.*;
import com.skillsync.group.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class GroupService {


    private final GroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;

    public GroupResponse createGroup(GroupRequest request) {
        LearningGroup group = LearningGroup.builder()
                .name(request.getName())
                .description(request.getDescription())
                .skills(request.getSkills())
                .createdBy(request.getCreatedBy())
                .build();
        group = groupRepository.save(group);

        // Creator auto-joins
        GroupMember member = GroupMember.builder()
                .group(group)
                .userId(request.getCreatedBy())
                .build();
        memberRepository.save(member);
        
        // Add to list for immediate response population
        group.getMembers().add(member);

        return mapToResponse(group);
    }

    public GroupResponse joinGroup(Long groupId, Long userId) {
        LearningGroup group = findGroup(groupId);
        if (memberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new RuntimeException("User already a member of this group");
        }
        GroupMember member = GroupMember.builder()
                .group(group)
                .userId(userId)
                .build();
        memberRepository.save(member);
        
        group.getMembers().add(member);
        
        return mapToResponse(group);
    }

    public GroupResponse leaveGroup(Long groupId, Long userId) {
        LearningGroup group = findGroup(groupId);
        boolean removed = group.getMembers().removeIf(m -> m.getUserId().equals(userId));
        if (!removed) {
            throw new RuntimeException("User is not a member of this group");
        }
        group = groupRepository.save(group);
        return mapToResponse(group);
    }

    public List<GroupResponse> getAllGroups() {
        return groupRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public GroupResponse getGroupById(Long id) {
        return mapToResponse(findGroup(id));
    }

    public void deleteGroup(Long id) {
        LearningGroup group = findGroup(id);
        memberRepository.deleteByGroup(group);
        groupRepository.delete(group);
    }

    private LearningGroup findGroup(Long id) {
        return groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found: " + id));
    }

    private GroupResponse mapToResponse(LearningGroup group) {
        List<GroupResponse.MemberInfo> members = group.getMembers().stream()
                .map(m -> GroupResponse.MemberInfo.builder()
                        .userId(m.getUserId())
                        .joinedAt(m.getJoinedAt())
                        .build())
                .collect(Collectors.toList());

        return GroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .skills(group.getSkills())
                .createdBy(group.getCreatedBy())
                .memberCount(members.size())
                .members(members)
                .createdAt(group.getCreatedAt())
                .build();
    }
}
