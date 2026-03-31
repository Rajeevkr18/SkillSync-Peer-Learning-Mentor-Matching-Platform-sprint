package com.skillsync.mentor.converter;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.core.type.TypeReference;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class StringOrListDeserializer extends JsonDeserializer<List<String>> {

    @Override
    public List<String> deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        if (p.getCurrentToken() == JsonToken.START_ARRAY) {
            return p.readValueAs(new TypeReference<List<String>>() {});
        } else if (p.getCurrentToken() == JsonToken.VALUE_STRING) {
            String text = p.getText();
            if (text == null || text.trim().isEmpty()) {
                return Collections.emptyList();
            }
            return Arrays.stream(text.split(","))
                    .map(String::trim)
                    .collect(Collectors.toList());
        }
        throw ctxt.mappingException("Expected JSON array or comma-separated string for skills");
    }
}
