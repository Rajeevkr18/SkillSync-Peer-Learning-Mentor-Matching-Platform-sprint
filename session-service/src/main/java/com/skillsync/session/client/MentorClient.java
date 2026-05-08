package com.skillsync.session.client;

import com.skillsync.session.dto.external.MentorAvailabilityResponse;
import com.skillsync.session.dto.external.MentorResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "mentor-service")
public interface MentorClient {

    @GetMapping("/mentors/{id}")
    MentorResponse getMentorById(@PathVariable("id") Long id);

    @GetMapping("/mentors/user/{userId}")
    MentorResponse getMentorByUserId(@PathVariable("userId") Long userId);

    @GetMapping("/mentors/{id}/slots/available")
    List<MentorAvailabilityResponse> getAvailableSlots(@PathVariable("id") Long id);

    @org.springframework.web.bind.annotation.PutMapping("/mentors/slots/{slotId}/book")
    void markSlotAsBooked(@PathVariable("slotId") Long slotId);
}
