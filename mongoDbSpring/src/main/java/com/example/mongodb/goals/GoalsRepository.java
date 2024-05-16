package com.example.mongodb.goals;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GoalsRepository extends MongoRepository<Goals, String> {
}
