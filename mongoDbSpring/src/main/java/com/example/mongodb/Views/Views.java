package com.example.mongodb.Views;

import lombok.NonNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


import java.time.LocalDateTime;
import java.util.Map;


@Setter
@Getter
@Document(collection = "views")
public class Views {

    @Id
    private String id;

    private String source;

    @NonNull
    private String url;

    private String visitor;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Map<String, Object> metadata;
}
