package com.skillsync.auth.controller;

import com.skillsync.auth.dto.*;
import com.skillsync.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/debug/admin")
    public ResponseEntity<Map<String, Object>> debugAdmin() {
        return ResponseEntity.ok(authService.getAdminDebugInfo());
    }

    @RequestMapping(value = {"/validate", "/validated"}, method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<Map<String, Boolean>> validateToken(@RequestParam("token") String token) {
        System.out.println("Validating token: " + (token != null ? token.substring(0, Math.min(token.length(), 10)) + "..." : "null"));
        boolean isValid = authService.validateToken(token);
        return ResponseEntity.ok(Map.of("valid", isValid));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<AuthResponse> getUserInfo(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(authService.getUserInfo(userId));
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<Void> updateUserRole(@PathVariable("userId") Long userId, @RequestParam("role") String role) {
        authService.updateUserRole(userId, role);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable("userId") Long userId) {
        authService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Test OK");
    }
}
