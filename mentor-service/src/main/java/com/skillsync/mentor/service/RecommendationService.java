package com.skillsync.mentor.service;

import com.skillsync.mentor.dto.MentorResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final MentorService mentorService;

    public List<MentorResponse> recommendMentors(List<String> preferredSkills) {
        // AI-based recommendation logic (Content-Based Filtering)
        // Suggests mentors based on user's preferred skills and sorts by rating
        return mentorService.getAllApprovedMentors().stream()
                .filter(mentor -> mentor.getSkills().stream().anyMatch(skill -> 
                    preferredSkills.stream().anyMatch(pref -> pref.equalsIgnoreCase(skill))))
                .sorted((m1, m2) -> m2.getRating().compareTo(m1.getRating()))
                .limit(5)
                .collect(Collectors.toList());
    }
}
