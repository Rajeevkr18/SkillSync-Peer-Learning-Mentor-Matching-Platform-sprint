package com.example.auth_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.auth_service.entity.User;
import com.example.auth_service.repository.UserRepository;
import com.example.auth_service.util.JwtUtil;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // ✅ Register
    public User register(User user) {

        User existing = userRepository.findByEmail(user.getEmail()).orElse(null);
        if (existing != null) {
            throw new RuntimeException("Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    // 🔐 Login with JWT
    public String login(String email, String password) {

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        boolean isMatch = passwordEncoder.matches(password, user.getPassword());

        if (!isMatch) {
            throw new RuntimeException("Invalid Password");
        }

        // 🔥 Generate JWT Token
        return jwtUtil.generateToken(email);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
}