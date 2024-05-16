package com.example.mongodb.goals;

import lombok.AllArgsConstructor;
import lombok.Value;

import java.util.Map;

@Value
@AllArgsConstructor
public class GoalsDTO {

    String source;
    String url;
    String goal;
    String visitor;
    Map<String, Object> metadata;
}
