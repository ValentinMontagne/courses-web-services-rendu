package com.example.mongodb.Views;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ViewsRepository extends MongoRepository<Views, String> {

    List<Views> findAllByVisitor(String visitor);
}
