package com.mycompany.myapp.service.impl;

import com.mycompany.myapp.service.RegionService;
import com.mycompany.myapp.domain.Region;
import com.mycompany.myapp.repository.RegionRepository;
import com.mycompany.myapp.service.dto.RegionDTO;
import com.mycompany.myapp.service.mapper.RegionMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service Implementation for managing Region.
 */
@Service
@Transactional
public class RegionServiceImpl implements RegionService{

    private final Logger log = LoggerFactory.getLogger(RegionServiceImpl.class);
    
    private final RegionRepository regionRepository;

    private final RegionMapper regionMapper;

    public RegionServiceImpl(RegionRepository regionRepository, RegionMapper regionMapper) {
        this.regionRepository = regionRepository;
        this.regionMapper = regionMapper;
    }

    /**
     * Save a region.
     *
     * @param regionDTO the entity to save
     * @return the persisted entity
     */
    @Override
    public RegionDTO save(RegionDTO regionDTO) {
        log.debug("Request to save Region : {}", regionDTO);
        Region region = regionMapper.regionDTOToRegion(regionDTO);
        region = regionRepository.save(region);
        RegionDTO result = regionMapper.regionToRegionDTO(region);
        return result;
    }

    /**
     *  Get all the regions.
     *  
     *  @return the list of entities
     */
    @Override
    @Transactional(readOnly = true)
    public List<RegionDTO> findAll() {
        log.debug("Request to get all Regions");
        List<RegionDTO> result = regionRepository.findAll().stream()
            .map(regionMapper::regionToRegionDTO)
            .collect(Collectors.toCollection(LinkedList::new));

        return result;
    }

    /**
     *  Get one region by id.
     *
     *  @param id the id of the entity
     *  @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public RegionDTO findOne(Long id) {
        log.debug("Request to get Region : {}", id);
        Region region = regionRepository.findOne(id);
        RegionDTO regionDTO = regionMapper.regionToRegionDTO(region);
        return regionDTO;
    }

    /**
     *  Delete the  region by id.
     *
     *  @param id the id of the entity
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete Region : {}", id);
        regionRepository.delete(id);
    }
}
