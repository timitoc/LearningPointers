package com.mycompany.myapp.service.mapper;

import com.mycompany.myapp.domain.Department;
import com.mycompany.myapp.domain.Location;
import com.mycompany.myapp.service.dto.DepartmentDTO;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2017-03-04T03:18:44+0200",
    comments = "version: 1.0.0.Final, compiler: javac, environment: Java 1.8.0_111 (Oracle Corporation)"
)
@Component
public class DepartmentMapperImpl implements DepartmentMapper {

    @Override
    public DepartmentDTO departmentToDepartmentDTO(Department department) {
        if ( department == null ) {
            return null;
        }

        DepartmentDTO departmentDTO = new DepartmentDTO();

        departmentDTO.setLocationId( departmentLocationId( department ) );
        departmentDTO.setId( department.getId() );
        departmentDTO.setDepartmentName( department.getDepartmentName() );

        return departmentDTO;
    }

    @Override
    public List<DepartmentDTO> departmentsToDepartmentDTOs(List<Department> departments) {
        if ( departments == null ) {
            return null;
        }

        List<DepartmentDTO> list = new ArrayList<DepartmentDTO>();
        for ( Department department : departments ) {
            list.add( departmentToDepartmentDTO( department ) );
        }

        return list;
    }

    @Override
    public Department departmentDTOToDepartment(DepartmentDTO departmentDTO) {
        if ( departmentDTO == null ) {
            return null;
        }

        Department department = new Department();

        department.setLocation( locationFromId( departmentDTO.getLocationId() ) );
        department.setId( departmentDTO.getId() );
        department.setDepartmentName( departmentDTO.getDepartmentName() );

        return department;
    }

    @Override
    public List<Department> departmentDTOsToDepartments(List<DepartmentDTO> departmentDTOs) {
        if ( departmentDTOs == null ) {
            return null;
        }

        List<Department> list = new ArrayList<Department>();
        for ( DepartmentDTO departmentDTO : departmentDTOs ) {
            list.add( departmentDTOToDepartment( departmentDTO ) );
        }

        return list;
    }

    private Long departmentLocationId(Department department) {

        if ( department == null ) {
            return null;
        }
        Location location = department.getLocation();
        if ( location == null ) {
            return null;
        }
        Long id = location.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
