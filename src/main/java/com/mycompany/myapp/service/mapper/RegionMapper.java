package com.mycompany.myapp.service.mapper;

import com.mycompany.myapp.domain.*;
import com.mycompany.myapp.service.dto.RegionDTO;

import org.mapstruct.*;
import java.util.List;

/**
 * Mapper for the entity Region and its DTO RegionDTO.
 */
@Mapper(componentModel = "spring", uses = {})
public interface RegionMapper {

    RegionDTO regionToRegionDTO(Region region);

    List<RegionDTO> regionsToRegionDTOs(List<Region> regions);

    Region regionDTOToRegion(RegionDTO regionDTO);

    List<Region> regionDTOsToRegions(List<RegionDTO> regionDTOs);
}
