package com.skillsync.group.service;

import com.skillsync.group.dto.*;
import com.skillsync.group.entity.*;
import com.skillsync.group.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
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

        return mapToResponse(groupRepository.findById(group.getId()).orElse(group));
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
        return mapToResponse(groupRepository.findById(groupId).orElse(group));
    }

    public GroupResponse leaveGroup(Long groupId, Long userId) {
        GroupMember member = memberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new RuntimeException("User is not a member of this group"));
        memberRepository.delete(member);
        return mapToResponse(findGroup(groupId));
    }

    public List<GroupResponse> getAllGroups() {
        return groupRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public GroupResponse getGroupById(Long id) {
        return mapToResponse(findGroup(id));
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
