package com.example.mongodb.Views;

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
public class ViewsService {

    private final ViewsRepository viewsRepository;

    public List<Views> getAllViews() {
        return viewsRepository.findAll();
    }

    public Mono<Views> saveView(ViewsDTO viewDTO) {
        if (viewDTO.getUrl() == null){
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'url doit être définie"));
        }
        LocalDateTime localDate = LocalDateTime.now();
        Views views = new Views();
        views.setUrl(viewDTO.getUrl());
        views.setSource(viewDTO.getSource());
        views.setVisitor(viewDTO.getVisitor());
        views.setCreatedAt(localDate);
        views.setUpdatedAt(localDate);
        if (viewDTO.getMetadata() != null) {
            views.setMetadata(new HashMap<>(viewDTO.getMetadata()));
        }
        return Mono.justOrEmpty(viewsRepository.save(views))
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)));
    }

    public Mono<Views> updateViews(String id,ViewsDTO viewsDTO){

        LocalDateTime localDate = LocalDateTime.now();
        Views views = viewsRepository.findById(id).orElseThrow();
        views.setUpdatedAt(localDate);
        if (viewsDTO.getUrl() != null){
            views.setUrl(viewsDTO.getUrl());
        }
        if (viewsDTO.getMetadata() != null){
            views.setMetadata(new HashMap<>(viewsDTO.getMetadata()));
        }
        if (viewsDTO.getVisitor() != null){
            views.setVisitor(viewsDTO.getVisitor());
        }
        if (viewsDTO.getSource() != null){
            views.setSource(viewsDTO.getSource());
        }
        return Mono.justOrEmpty(viewsRepository.save(views))
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR)));
    }
    public Mono<String> deleteViews(String id){
        if(viewsRepository.existsById(id)){
            viewsRepository.deleteById(id);
            return Mono.just("Views : " + id + "has been deleted");
        }
        else {
            return Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND));
        }
    }
}
