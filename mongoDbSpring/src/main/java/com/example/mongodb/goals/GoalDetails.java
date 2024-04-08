package com.example.mongodb.goals;

import com.example.mongodb.Actions.Actions;
import com.example.mongodb.Views.Views;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Setter
@Getter
@Document(collection = "goalsDetails")
public class GoalDetails {
    private Goals goal;
    private List<Views> views;
    private List<Actions> actions;

    public GoalDetails(Goals goal, List<Views> views, List<Actions> actions) {
        this.goal = goal;
        this.views = views;
        this.actions = actions;
    }

    // Getters and setters
}
