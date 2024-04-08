package com.example.mongodb.Actions;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class ActionsController {

    private final ActionsService actionsService;

    @GetMapping("/actions")
    public Flux<Actions> getAllActions() {
        return Flux.fromIterable(actionsService.getAll());
    }

    @PostMapping("/actions")
    public Mono<Actions> saveActions(@RequestBody ActionsDTO actionsDTO){
        return actionsService.createAction(actionsDTO);
    }

    @PutMapping("/actions/:id")
    public Mono<Actions> updateActions(@PathVariable String id, @RequestBody ActionsDTO actionsDTO){
        return actionsService.updateAction(id, actionsDTO);
    }
    @DeleteMapping("/actions/:id")
    public Mono<String> deleteActions(@PathVariable String id){
        return actionsService.deleteAction(id);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<String> handleResponseStatusException(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(ex.getReason());
    }
}
