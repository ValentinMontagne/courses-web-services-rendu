package com.example.mongodb.Views;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class ViewsController {

    private final ViewsService viewsService;


    @GetMapping("/views")
    public Flux<Views> getAllViews() {
        return Flux.fromIterable(viewsService.getAllViews());
    }

    @PostMapping("/views")
    public Mono<Views> saveViews(@RequestBody ViewsDTO viewsDTO){
        return viewsService.saveView(viewsDTO);
    }

    @PutMapping("/views/:id")
    public Mono<Views> updateViews(@PathVariable String id, @RequestBody ViewsDTO viewsDTO){
        return viewsService.updateViews(id, viewsDTO);
    }
    @DeleteMapping("/views/:id")
    public Mono<String> deleteViews(@PathVariable String id){
         return viewsService.deleteViews(id);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<String> handleResponseStatusException(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(ex.getReason());
    }
}
