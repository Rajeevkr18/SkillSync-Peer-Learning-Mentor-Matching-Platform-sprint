package com.skillsync.mentor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorApplicationRequest {
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Name is required")
    private String name;

    private String bio;
    private Integer experience;
    private Double hourlyRate;

    @NotEmpty(message = "Skills are required")
    @com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.skillsync.mentor.converter.StringOrListDeserializer.class)
    private List<String> skills;
}
