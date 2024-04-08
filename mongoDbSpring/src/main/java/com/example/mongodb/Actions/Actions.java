package com.example.mongodb.Actions;

import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Setter
@Getter
@Document(collection = "actions")
public class Actions {

    @Id
    private String id;

    private String source;

    @NonNull
    private String url;
    private String action;
    private String visitor;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Map<String, Object> metadata;
}
