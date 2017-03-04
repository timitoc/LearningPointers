package com.mycompany.myapp.service.mapper;

import com.mycompany.myapp.domain.*;
import com.mycompany.myapp.service.dto.CountryDTO;

import org.mapstruct.*;
import java.util.List;

/**
 * Mapper for the entity Country and its DTO CountryDTO.
 */
@Mapper(componentModel = "spring", uses = {})
public interface CountryMapper {

    @Mapping(source = "region.id", target = "regionId")
    CountryDTO countryToCountryDTO(Country country);

    List<CountryDTO> countriesToCountryDTOs(List<Country> countries);

    @Mapping(source = "regionId", target = "region")
    Country countryDTOToCountry(CountryDTO countryDTO);

    List<Country> countryDTOsToCountries(List<CountryDTO> countryDTOs);

    default Region regionFromId(Long id) {
        if (id == null) {
            return null;
        }
        Region region = new Region();
        region.setId(id);
        return region;
    }
}
