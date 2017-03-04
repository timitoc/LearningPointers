package com.mycompany.myapp.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.mycompany.myapp.service.JobHistoryService;
import com.mycompany.myapp.web.rest.util.HeaderUtil;
import com.mycompany.myapp.web.rest.util.PaginationUtil;
import com.mycompany.myapp.service.dto.JobHistoryDTO;
import io.swagger.annotations.ApiParam;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST controller for managing JobHistory.
 */
@RestController
@RequestMapping("/api")
public class JobHistoryResource {

    private final Logger log = LoggerFactory.getLogger(JobHistoryResource.class);

    private static final String ENTITY_NAME = "jobHistory";
        
    private final JobHistoryService jobHistoryService;

    public JobHistoryResource(JobHistoryService jobHistoryService) {
        this.jobHistoryService = jobHistoryService;
    }

    /**
     * POST  /job-histories : Create a new jobHistory.
     *
     * @param jobHistoryDTO the jobHistoryDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new jobHistoryDTO, or with status 400 (Bad Request) if the jobHistory has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/job-histories")
    @Timed
    public ResponseEntity<JobHistoryDTO> createJobHistory(@RequestBody JobHistoryDTO jobHistoryDTO) throws URISyntaxException {
        log.debug("REST request to save JobHistory : {}", jobHistoryDTO);
        if (jobHistoryDTO.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "idexists", "A new jobHistory cannot already have an ID")).body(null);
        }
        JobHistoryDTO result = jobHistoryService.save(jobHistoryDTO);
        return ResponseEntity.created(new URI("/api/job-histories/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /job-histories : Updates an existing jobHistory.
     *
     * @param jobHistoryDTO the jobHistoryDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated jobHistoryDTO,
     * or with status 400 (Bad Request) if the jobHistoryDTO is not valid,
     * or with status 500 (Internal Server Error) if the jobHistoryDTO couldnt be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/job-histories")
    @Timed
    public ResponseEntity<JobHistoryDTO> updateJobHistory(@RequestBody JobHistoryDTO jobHistoryDTO) throws URISyntaxException {
        log.debug("REST request to update JobHistory : {}", jobHistoryDTO);
        if (jobHistoryDTO.getId() == null) {
            return createJobHistory(jobHistoryDTO);
        }
        JobHistoryDTO result = jobHistoryService.save(jobHistoryDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, jobHistoryDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /job-histories : get all the jobHistories.
     *
     * @param pageable the pagination information
     * @return the ResponseEntity with status 200 (OK) and the list of jobHistories in body
     * @throws URISyntaxException if there is an error to generate the pagination HTTP headers
     */
    @GetMapping("/job-histories")
    @Timed
    public ResponseEntity<List<JobHistoryDTO>> getAllJobHistories(@ApiParam Pageable pageable)
        throws URISyntaxException {
        log.debug("REST request to get a page of JobHistories");
        Page<JobHistoryDTO> page = jobHistoryService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/job-histories");
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    /**
     * GET  /job-histories/:id : get the "id" jobHistory.
     *
     * @param id the id of the jobHistoryDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the jobHistoryDTO, or with status 404 (Not Found)
     */
    @GetMapping("/job-histories/{id}")
    @Timed
    public ResponseEntity<JobHistoryDTO> getJobHistory(@PathVariable Long id) {
        log.debug("REST request to get JobHistory : {}", id);
        JobHistoryDTO jobHistoryDTO = jobHistoryService.findOne(id);
        return ResponseUtil.wrapOrNotFound(Optional.ofNullable(jobHistoryDTO));
    }

    /**
     * DELETE  /job-histories/:id : delete the "id" jobHistory.
     *
     * @param id the id of the jobHistoryDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/job-histories/{id}")
    @Timed
    public ResponseEntity<Void> deleteJobHistory(@PathVariable Long id) {
        log.debug("REST request to delete JobHistory : {}", id);
        jobHistoryService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

}
