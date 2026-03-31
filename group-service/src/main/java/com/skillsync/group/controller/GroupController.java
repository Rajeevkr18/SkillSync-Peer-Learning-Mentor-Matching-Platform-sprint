package com.skillsync.group.controller;

import com.skillsync.group.dto.*;
import com.skillsync.group.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping
    public ResponseEntity<GroupResponse> createGroup(@Valid @RequestBody GroupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(groupService.createGroup(request));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<GroupResponse> joinGroup(
            @PathVariable Long id,
            @RequestBody(required = false) Object body,
            @RequestParam(required = false) Long userId) {
        Long extractedUserId = extractUserId(body, userId);
        if (extractedUserId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(groupService.joinGroup(id, extractedUserId));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<GroupResponse> leaveGroup(
            @PathVariable Long id,
            @RequestBody(required = false) Object body,
            @RequestParam(required = false) Long userId) {
        Long extractedUserId = extractUserId(body, userId);
        if (extractedUserId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(groupService.leaveGroup(id, extractedUserId));
    }

    private Long extractUserId(Object body, Long queryUserId) {
        if (queryUserId != null) return queryUserId;
        if (body == null) return null;
        
        if (body instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) body;
            Object val = map.get("userId");
            if (val != null) {
                return Long.valueOf(val.toString());
            }
        } else if (body instanceof Number) {
            return ((Number) body).longValue();
        } else {
            try {
                return Long.parseLong(body.toString());
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }



    @GetMapping
    public ResponseEntity<List<GroupResponse>> getAllGroups() {
        return ResponseEntity.ok(groupService.getAllGroups());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupResponse> getGroupById(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.getGroupById(id));
    }
}
