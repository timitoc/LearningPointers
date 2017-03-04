package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Job;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Spring Data JPA repository for the Job entity.
 */
@SuppressWarnings("unused")
public interface JobRepository extends JpaRepository<Job,Long> {

    @Query("select distinct job from Job job left join fetch job.tasks")
    List<Job> findAllWithEagerRelationships();

    @Query("select job from Job job left join fetch job.tasks where job.id =:id")
    Job findOneWithEagerRelationships(@Param("id") Long id);

}
