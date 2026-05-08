package com.skillsync.auth.repository;

import com.skillsync.auth.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);

    @Modifying
    @Transactional
    @Query(value = "INSERT IGNORE INTO user_roles (user_id, role_id) SELECT :userId, r.id FROM roles r WHERE r.name = :roleName", nativeQuery = true)
    void forceAssignRoleToUser(@Param("userId") Long userId, @Param("roleName") String roleName);
}
