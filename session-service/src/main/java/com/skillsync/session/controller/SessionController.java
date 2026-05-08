package com.skillsync.session.controller;

import com.skillsync.session.dto.*;
import com.skillsync.session.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @PostMapping
    public ResponseEntity<SessionResponse> bookSession(@Valid @RequestBody SessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sessionService.bookSession(request));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<SessionResponse> acceptSession(@PathVariable("id") Long id) {
        return ResponseEntity.ok(sessionService.acceptSession(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<SessionResponse> rejectSession(@PathVariable("id") Long id) {
        return ResponseEntity.ok(sessionService.rejectSession(id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<SessionResponse> cancelSession(@PathVariable("id") Long id) {
        return ResponseEntity.ok(sessionService.cancelSession(id));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<SessionResponse> completeSession(@PathVariable("id") Long id) {
        return ResponseEntity.ok(sessionService.completeSession(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SessionResponse>> getUserSessions(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(sessionService.getUserSessions(userId));
    }

    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<List<SessionResponse>> getMentorSessions(@PathVariable("mentorId") Long mentorId) {
        return ResponseEntity.ok(sessionService.getMentorSessions(mentorId));
    }

    @GetMapping
    public ResponseEntity<List<SessionResponse>> getAllSessions() {
        return ResponseEntity.ok(sessionService.getAllSessions());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable("id") Long id) {
        sessionService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }
}
