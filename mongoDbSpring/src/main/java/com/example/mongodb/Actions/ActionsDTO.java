package com.example.mongodb.Actions;

import lombok.AllArgsConstructor;
import lombok.NonNull;
import lombok.Value;
import org.springframework.data.annotation.Id;

import java.time.LocalDateTime;
import java.util.Map;

@Value
@AllArgsConstructor
public class ActionsDTO {

    String source;
    String url;
    String action;
    String visitor;
    Map<String, Object> metadata;

}
