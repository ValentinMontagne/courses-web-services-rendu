package com.example.mongodb.goals;
import com.example.mongodb.Actions.Actions;
import com.example.mongodb.Actions.ActionsRepository;
import com.example.mongodb.Views.Views;
import com.example.mongodb.Views.ViewsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalsService {

    private final GoalsRepository goalsRepository;
    private final ViewsRepository viewsRepository;
    private final ActionsRepository actionsRepository;

    public List<Goals> getAll(){
        return goalsRepository.findAll();
    }
    public Mono<Goals> getById(String id){
        return Mono.justOrEmpty(goalsRepository.findById(id))
                .switchIfEmpty(Mono.defer( () -> Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND))));
    }

    public Mono<GoalDetails> getDetails(String goalId) {
        Goals goal = goalsRepository.findById(goalId).orElseThrow();
        List<Views> views = viewsRepository.findAllByVisitor(goal.getVisitor());
        List<Actions> actions = actionsRepository.findAllByVisitor(goal.getVisitor());
        return Mono.justOrEmpty(new GoalDetails(goal, views, actions))
                .switchIfEmpty(Mono.defer( () -> Mono.error(new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR))));
    }
    public Mono<Goals> createAction(GoalsDTO goalsDTO){
        if (goalsDTO.getUrl() == null){
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'url doit être définie"));
        }
        LocalDateTime localDate = LocalDateTime.now();
        Goals goals = new Goals();
       goals.setUrl(goalsDTO.getUrl());
       goals.setGoal(goalsDTO.getGoal());
       goals.setSource(goalsDTO.getSource());
       goals.setVisitor(goalsDTO.getVisitor());
       goals.setCreatedAt(localDate);
       goals.setUpdatedAt(localDate);
        if (goalsDTO.getMetadata() != null) {
           goals.setMetadata(new HashMap<>(goalsDTO.getMetadata()));
        }
        return Mono.justOrEmpty(goalsRepository.save(goals))
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)));
    }
    public Mono<Goals> updateAction(String id, GoalsDTO goalsDTO){
        LocalDateTime localDate = LocalDateTime.now();
        Goals goals =goalsRepository.findById(id).orElseThrow();
       goals.setUpdatedAt(localDate);
        if (goalsDTO.getUrl() != null){
           goals.setUrl(goalsDTO.getUrl());
        }
        if (goalsDTO.getGoal() != null){
           goals.setGoal(goalsDTO.getGoal());
        }
        if (goalsDTO.getMetadata() != null){
           goals.setMetadata(new HashMap<>(goalsDTO.getMetadata()));
        }
        if (goalsDTO.getVisitor() != null){
           goals.setVisitor(goalsDTO.getVisitor());
        }
        if (goalsDTO.getSource() != null){
           goals.setSource(goalsDTO.getSource());
        }
        return Mono.justOrEmpty(goalsRepository.save(goals))
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)));
    }
    public Mono<String> deleteAction(String id){
        if(goalsRepository.existsById(id)){
           goalsRepository.deleteById(id);
            return Mono.just("Goals : " + id + "has been deleted");
        }
        else {
            return Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND));
        }
    }
}
