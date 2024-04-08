package com.example.mongodb.goals;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class GoalsController {

    private final GoalsService goalsService;

    @GetMapping("/goals")
    public Flux<Goals> getAllGoals() {
        return Flux.fromIterable(goalsService.getAll());
    }

    @GetMapping("/goals/{id}")
    public Mono<Goals> getById(@PathVariable String id) {
        return goalsService.getById(id);
    }

    @GetMapping("/goals/{id}/details")
    public Mono<GoalDetails> getDetails(@PathVariable String id) {
        return goalsService.getDetails(id);
    }

    @PostMapping("/goals")
    public Mono<Goals> saveGoals(@RequestBody GoalsDTO goalsDTO){
        return goalsService.createAction(goalsDTO);
    }

    @PutMapping("/goals/:id")
    public Mono<Goals> updateGoals(@PathVariable String id, @RequestBody GoalsDTO goalsDTO){
        return goalsService.updateAction(id, goalsDTO);
    }
    @DeleteMapping("/goals/:id")
    public Mono<String> deleteGoals(@PathVariable String id){
        return goalsService.deleteAction(id);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<String> handleResponseStatusException(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(ex.getReason());
    }
}
