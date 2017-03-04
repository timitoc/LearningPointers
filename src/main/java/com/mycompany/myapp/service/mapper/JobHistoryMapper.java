package com.mycompany.myapp.service.mapper;

import com.mycompany.myapp.domain.*;
import com.mycompany.myapp.service.dto.JobHistoryDTO;

import org.mapstruct.*;
import java.util.List;

/**
 * Mapper for the entity JobHistory and its DTO JobHistoryDTO.
 */
@Mapper(componentModel = "spring", uses = {})
public interface JobHistoryMapper {

    @Mapping(source = "job.id", target = "jobId")
    @Mapping(source = "department.id", target = "departmentId")
    @Mapping(source = "employee.id", target = "employeeId")
    JobHistoryDTO jobHistoryToJobHistoryDTO(JobHistory jobHistory);

    List<JobHistoryDTO> jobHistoriesToJobHistoryDTOs(List<JobHistory> jobHistories);

    @Mapping(source = "jobId", target = "job")
    @Mapping(source = "departmentId", target = "department")
    @Mapping(source = "employeeId", target = "employee")
    JobHistory jobHistoryDTOToJobHistory(JobHistoryDTO jobHistoryDTO);

    List<JobHistory> jobHistoryDTOsToJobHistories(List<JobHistoryDTO> jobHistoryDTOs);

    default Job jobFromId(Long id) {
        if (id == null) {
            return null;
        }
        Job job = new Job();
        job.setId(id);
        return job;
    }

    default Department departmentFromId(Long id) {
        if (id == null) {
            return null;
        }
        Department department = new Department();
        department.setId(id);
        return department;
    }

    default Employee employeeFromId(Long id) {
        if (id == null) {
            return null;
        }
        Employee employee = new Employee();
        employee.setId(id);
        return employee;
    }
}
