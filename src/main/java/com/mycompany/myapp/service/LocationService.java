package com.mycompany.myapp.service;

import com.mycompany.myapp.service.dto.LocationDTO;
import java.util.List;

/**
 * Service Interface for managing Location.
 */
public interface LocationService {

    /**
     * Save a location.
     *
     * @param locationDTO the entity to save
     * @return the persisted entity
     */
    LocationDTO save(LocationDTO locationDTO);

    /**
     *  Get all the locations.
     *  
     *  @return the list of entities
     */
    List<LocationDTO> findAll();

    /**
     *  Get the "id" location.
     *
     *  @param id the id of the entity
     *  @return the entity
     */
    LocationDTO findOne(Long id);

    /**
     *  Delete the "id" location.
     *
     *  @param id the id of the entity
     */
    void delete(Long id);
}
