package com.example.auth_service.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.auth_service.dto.AuthRequest;
import com.example.auth_service.dto.AuthResponse;
import com.example.auth_service.entity.User;
import com.example.auth_service.service.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // ✅ REGISTER
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return authService.register(user);
    }

    // 🔐 LOGIN → returns JWT
    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {

        String token = authService.login(request.getEmail(), request.getPassword());

        return new AuthResponse(token);
    }

    // ✅ TEST
    @GetMapping("/test")
    public String test() {
        return "Auth working 🚀";
    }
}