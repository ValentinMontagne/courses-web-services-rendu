package com.example.mongodb.Views;

import lombok.AllArgsConstructor;
import lombok.Value;

import java.util.Map;

@Value
@AllArgsConstructor
public class ViewsDTO {

    String source;
    String url;
    String visitor;
    Map<String, Object> metadata;
}
