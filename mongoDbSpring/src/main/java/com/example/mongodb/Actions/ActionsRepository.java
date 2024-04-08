package com.example.mongodb.Actions;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface ActionsRepository extends MongoRepository<Actions, String> {

    List<Actions> findAllByVisitor(String visitor);
}
