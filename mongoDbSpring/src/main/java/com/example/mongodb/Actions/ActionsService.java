package com.example.mongodb.Actions;

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
public class ActionsService {

    private final ActionsRepository actionsRepository;

    public List<Actions> getAll(){
        return actionsRepository.findAll();
    }
    public Mono<Actions> createAction(ActionsDTO actionsDTO){
        if (actionsDTO.getUrl() == null){
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'url doit être définie"));
        }
        LocalDateTime localDate = LocalDateTime.now();
        Actions actions = new Actions();
        actions.setUrl(actionsDTO.getUrl());
        actions.setAction(actionsDTO.getAction());
        actions.setSource(actionsDTO.getSource());
        actions.setVisitor(actionsDTO.getVisitor());
        actions.setCreatedAt(localDate);
        actions.setUpdatedAt(localDate);
        if (actionsDTO.getMetadata() != null) {
            actions.setMetadata(new HashMap<>(actionsDTO.getMetadata()));
        }
        return Mono.justOrEmpty(actionsRepository.save(actions))
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)));
    }
    public Mono<Actions> updateAction(String id, ActionsDTO actionsDTO){
        LocalDateTime localDate = LocalDateTime.now();
        Actions actions = actionsRepository.findById(id).orElseThrow();
        actions.setUpdatedAt(localDate);
        if (actionsDTO.getUrl() != null){
            actions.setUrl(actionsDTO.getUrl());
        }
        if (actionsDTO.getAction() != null){
            actions.setAction(actionsDTO.getAction());
        }
        if (actionsDTO.getMetadata() != null){
            actions.setMetadata(new HashMap<>(actionsDTO.getMetadata()));
        }
        if (actionsDTO.getVisitor() != null){
            actions.setVisitor(actionsDTO.getVisitor());
        }
        if (actionsDTO.getSource() != null){
            actions.setSource(actionsDTO.getSource());
        }
        return Mono.justOrEmpty(actionsRepository.save(actions))
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)));
    }
    public Mono<String> deleteAction(String id){
        if(actionsRepository.existsById(id)){
            actionsRepository.deleteById(id);
            return Mono.just("Actions : " + id + "has been deleted");
        }
        else {
            return Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND));
        }
    }
}
