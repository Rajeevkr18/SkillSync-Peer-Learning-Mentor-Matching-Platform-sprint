package com.skillsync.group.repository;

import com.skillsync.group.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    Optional<GroupMember> findByGroupIdAndUserId(Long groupId, Long userId);
    boolean existsByGroupIdAndUserId(Long groupId, Long userId);
}
