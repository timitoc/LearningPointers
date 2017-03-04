package com.mycompany.myapp.service.mapper;

import com.mycompany.myapp.domain.*;
import com.mycompany.myapp.service.dto.JobDTO;

import org.mapstruct.*;
import java.util.List;

/**
 * Mapper for the entity Job and its DTO JobDTO.
 */
@Mapper(componentModel = "spring", uses = {TaskMapper.class, })
public interface JobMapper {

    @Mapping(source = "employee.id", target = "employeeId")
    JobDTO jobToJobDTO(Job job);

    List<JobDTO> jobsToJobDTOs(List<Job> jobs);

    @Mapping(source = "employeeId", target = "employee")
    Job jobDTOToJob(JobDTO jobDTO);

    List<Job> jobDTOsToJobs(List<JobDTO> jobDTOs);

    default Employee employeeFromId(Long id) {
        if (id == null) {
            return null;
        }
        Employee employee = new Employee();
        employee.setId(id);
        return employee;
    }

    default Task taskFromId(Long id) {
        if (id == null) {
            return null;
        }
        Task task = new Task();
        task.setId(id);
        return task;
    }
}
