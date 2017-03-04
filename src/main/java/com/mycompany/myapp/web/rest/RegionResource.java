package com.mycompany.myapp.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.mycompany.myapp.service.RegionService;
import com.mycompany.myapp.web.rest.util.HeaderUtil;
import com.mycompany.myapp.service.dto.RegionDTO;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST controller for managing Region.
 */
@RestController
@RequestMapping("/api")
public class RegionResource {

    private final Logger log = LoggerFactory.getLogger(RegionResource.class);

    private static final String ENTITY_NAME = "region";
        
    private final RegionService regionService;

    public RegionResource(RegionService regionService) {
        this.regionService = regionService;
    }

    /**
     * POST  /regions : Create a new region.
     *
     * @param regionDTO the regionDTO to create
     * @return the ResponseEntity with status 201 (Created) and with body the new regionDTO, or with status 400 (Bad Request) if the region has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/regions")
    @Timed
    public ResponseEntity<RegionDTO> createRegion(@RequestBody RegionDTO regionDTO) throws URISyntaxException {
        log.debug("REST request to save Region : {}", regionDTO);
        if (regionDTO.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "idexists", "A new region cannot already have an ID")).body(null);
        }
        RegionDTO result = regionService.save(regionDTO);
        return ResponseEntity.created(new URI("/api/regions/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /regions : Updates an existing region.
     *
     * @param regionDTO the regionDTO to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated regionDTO,
     * or with status 400 (Bad Request) if the regionDTO is not valid,
     * or with status 500 (Internal Server Error) if the regionDTO couldnt be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/regions")
    @Timed
    public ResponseEntity<RegionDTO> updateRegion(@RequestBody RegionDTO regionDTO) throws URISyntaxException {
        log.debug("REST request to update Region : {}", regionDTO);
        if (regionDTO.getId() == null) {
            return createRegion(regionDTO);
        }
        RegionDTO result = regionService.save(regionDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, regionDTO.getId().toString()))
            .body(result);
    }

    /**
     * GET  /regions : get all the regions.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of regions in body
     */
    @GetMapping("/regions")
    @Timed
    public List<RegionDTO> getAllRegions() {
        log.debug("REST request to get all Regions");
        return regionService.findAll();
    }

    /**
     * GET  /regions/:id : get the "id" region.
     *
     * @param id the id of the regionDTO to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the regionDTO, or with status 404 (Not Found)
     */
    @GetMapping("/regions/{id}")
    @Timed
    public ResponseEntity<RegionDTO> getRegion(@PathVariable Long id) {
        log.debug("REST request to get Region : {}", id);
        RegionDTO regionDTO = regionService.findOne(id);
        return ResponseUtil.wrapOrNotFound(Optional.ofNullable(regionDTO));
    }

    /**
     * DELETE  /regions/:id : delete the "id" region.
     *
     * @param id the id of the regionDTO to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/regions/{id}")
    @Timed
    public ResponseEntity<Void> deleteRegion(@PathVariable Long id) {
        log.debug("REST request to delete Region : {}", id);
        regionService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

}
