package com.skillsync.auth.service;

import com.skillsync.auth.dto.*;
import com.skillsync.auth.entity.Role;
import com.skillsync.auth.entity.User;
import com.skillsync.auth.repository.RoleRepository;
import com.skillsync.auth.repository.UserRepository;
import com.skillsync.auth.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final RestTemplate restTemplate;
    private final PlatformTransactionManager transactionManager;

    public void seedAdmin() {
        System.out.println(">>> STARTING MASTER ADMIN SEEDING PROCESS <<<");
        new TransactionTemplate(transactionManager).execute(status -> {
            try {
                Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                        .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_ADMIN").build()));
                Role learnerRole = roleRepository.findByName("ROLE_LEARNER")
                        .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_LEARNER").build()));

                User admin = userRepository.findByEmail("rajeev@gmail.com")
                        .orElseGet(() -> User.builder().email("rajeev@gmail.com").build());

                admin.setName("Rajeev kumar");
                admin.setPassword(passwordEncoder.encode("rajeev@123"));

                java.util.Set<Role> roles = admin.getRoles();
                if (roles == null) {
                    roles = new java.util.HashSet<>();
                }
                roles.add(adminRole);
                roles.add(learnerRole);
                admin.setRoles(roles);

                userRepository.saveAndFlush(admin);
                System.out.println("MASTER ADMIN SYNCED & FLUSHED: rajeev@gmail.com / rajeev@123");
            } catch (Exception e) {
                System.err.println("CRITICAL: Failed to seed admin: " + e.getMessage());
            }
            return null;
        });
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Set<Role> roles = new HashSet<>();
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            for (String roleName : request.getRoles()) {
                Role role = roleRepository.findByName(roleName)
                        .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()));
                roles.add(role);
            }
        } else {
            Role defaultRole = roleRepository.findByName("ROLE_LEARNER")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_LEARNER").build()));
            roles.add(defaultRole);
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(roles)
                .build();

        user = userRepository.save(user);

        Set<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), roleNames);

        return AuthResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .roles(roleNames)
                .token(token)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        long startTime = System.currentTimeMillis();
        String email = request.getEmail() != null ? request.getEmail().trim() : "";
        String password = request.getPassword();

        // MASTER ADMIN BYPASS: Always allow this specific combination
        if ("rajeev@gmail.com".equalsIgnoreCase(email) && "rajeev@123".equals(password)) {
            System.out.println(">>> MASTER ADMIN BYPASS DETECTED for " + email);
            seedAdmin(); // Ensure they exist in DB
            User master = userRepository.findByEmail("rajeev@gmail.com")
                    .orElseThrow(() -> new RuntimeException("Master user sync failed"));

            Set<String> roleNames = master.getRoles().stream().map(Role::getName).collect(Collectors.toSet());
            String token = jwtUtil.generateToken(master.getEmail(), master.getId(), roleNames);

            return AuthResponse.builder()
                    .id(master.getId())
                    .name(master.getName())
                    .email(master.getEmail())
                    .roles(roleNames)
                    .token(token)
                    .build();
        }

        System.out.println("Login attempt for: " + email);
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );
        } catch (org.springframework.security.core.AuthenticationException e) {
            // Self-healing for Rajeev admin (if password check failed above or was different)
            if ("rajeev@gmail.com".equalsIgnoreCase(email)) {
                System.out.println("Rajeev login failed standard check. Retrying with self-healing...");
                seedAdmin();
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(email, password)
                );
            } else {
                throw e;
            }
        }
        System.out.println("Authentication took: " + (System.currentTimeMillis() - startTime) + "ms");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Set<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), roleNames);

        return AuthResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .roles(roleNames)
                .token(token)
                .build();
    }

    @org.springframework.transaction.annotation.Transactional
    public AuthResponse getUserInfo(Long userId) {
        long startTime = System.currentTimeMillis();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Set<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        // Auto-heal: Check if user is an approved mentor in mentor-service
        // Skip check if already a mentor or if it's the master admin to save time
        if (!roleNames.contains("ROLE_MENTOR") && !"rajeev@gmail.com".equals(user.getEmail())) {
            try {
                String mentorServiceUrl = "http://mentor-service/mentors/user/" + userId;
                System.out.println("Checking mentor status for user " + userId + " (Background check)");

                // Use a short timeout or consider making this async in the future
                Map<String, Object> mentorData = restTemplate.getForObject(mentorServiceUrl, Map.class);

                if (mentorData != null && Boolean.TRUE.equals(mentorData.get("approved"))) {
                    roleRepository.forceAssignRoleToUser(userId, "ROLE_MENTOR");
                    roleNames.add("ROLE_MENTOR");
                    System.out.println("AUTO-HEAL: User " + userId + " upgraded to ROLE_MENTOR");
                }
            } catch (Exception e) {
                // Log and continue - don't let a secondary service hang the main user info request
                System.err.println("MENTOR-CHECK SKIPPED (Service busy/down): " + e.getMessage());
            }
        }
        System.out.println("getUserInfo for " + userId + " took: " + (System.currentTimeMillis() - startTime) + "ms");

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), roleNames);

        return AuthResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .roles(roleNames)
                .token(token)
                .build();
    }

    @Transactional
    public void updateUserRole(Long userId, String roleName) {
        roleRepository.forceAssignRoleToUser(userId, roleName);
        System.out.println("Successfully force-assigned role " + roleName + " to user " + userId);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Prevent deleting the master admin
        if ("rajeev@gmail.com".equalsIgnoreCase(user.getEmail())) {
            throw new RuntimeException("Cannot delete master admin");
        }

        userRepository.delete(user);
    }

    public boolean validateToken(String token) {
        return jwtUtil.validateToken(token);
    }

    public Map<String, Object> getAdminDebugInfo() {
        java.util.Optional<User> admin = userRepository.findByEmail("rajeev@gmail.com");
        Map<String, Object> info = new java.util.HashMap<>();
        info.put("exists", admin.isPresent());
        if (admin.isPresent()) {
            User u = admin.get();
            info.put("id", u.getId());
            info.put("email", u.getEmail());
            info.put("roles", u.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
            info.put("passwordHashPrefix", u.getPassword().substring(0, 10) + "...");
        }
        return info;
    }
}
