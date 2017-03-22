package com.mycompany.myapp.service.mapper;

import com.mycompany.myapp.domain.Department;
import com.mycompany.myapp.domain.Employee;
import com.mycompany.myapp.domain.Job;
import com.mycompany.myapp.domain.JobHistory;
import com.mycompany.myapp.service.dto.JobHistoryDTO;
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
public class JobHistoryMapperImpl implements JobHistoryMapper {

    @Override
    public JobHistoryDTO jobHistoryToJobHistoryDTO(JobHistory jobHistory) {
        if ( jobHistory == null ) {
            return null;
        }

        JobHistoryDTO jobHistoryDTO = new JobHistoryDTO();

        jobHistoryDTO.setJobId( jobHistoryJobId( jobHistory ) );
        jobHistoryDTO.setEmployeeId( jobHistoryEmployeeId( jobHistory ) );
        jobHistoryDTO.setDepartmentId( jobHistoryDepartmentId( jobHistory ) );
        jobHistoryDTO.setId( jobHistory.getId() );
        jobHistoryDTO.setStartDate( jobHistory.getStartDate() );
        jobHistoryDTO.setEndDate( jobHistory.getEndDate() );
        jobHistoryDTO.setLanguage( jobHistory.getLanguage() );

        return jobHistoryDTO;
    }

    @Override
    public List<JobHistoryDTO> jobHistoriesToJobHistoryDTOs(List<JobHistory> jobHistories) {
        if ( jobHistories == null ) {
            return null;
        }

        List<JobHistoryDTO> list = new ArrayList<JobHistoryDTO>();
        for ( JobHistory jobHistory : jobHistories ) {
            list.add( jobHistoryToJobHistoryDTO( jobHistory ) );
        }

        return list;
    }

    @Override
    public JobHistory jobHistoryDTOToJobHistory(JobHistoryDTO jobHistoryDTO) {
        if ( jobHistoryDTO == null ) {
            return null;
        }

        JobHistory jobHistory = new JobHistory();

        jobHistory.setJob( jobFromId( jobHistoryDTO.getJobId() ) );
        jobHistory.setDepartment( departmentFromId( jobHistoryDTO.getDepartmentId() ) );
        jobHistory.setEmployee( employeeFromId( jobHistoryDTO.getEmployeeId() ) );
        jobHistory.setId( jobHistoryDTO.getId() );
        jobHistory.setStartDate( jobHistoryDTO.getStartDate() );
        jobHistory.setEndDate( jobHistoryDTO.getEndDate() );
        jobHistory.setLanguage( jobHistoryDTO.getLanguage() );

        return jobHistory;
    }

    @Override
    public List<JobHistory> jobHistoryDTOsToJobHistories(List<JobHistoryDTO> jobHistoryDTOs) {
        if ( jobHistoryDTOs == null ) {
            return null;
        }

        List<JobHistory> list = new ArrayList<JobHistory>();
        for ( JobHistoryDTO jobHistoryDTO : jobHistoryDTOs ) {
            list.add( jobHistoryDTOToJobHistory( jobHistoryDTO ) );
        }

        return list;
    }

    private Long jobHistoryJobId(JobHistory jobHistory) {

        if ( jobHistory == null ) {
            return null;
        }
        Job job = jobHistory.getJob();
        if ( job == null ) {
            return null;
        }
        Long id = job.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private Long jobHistoryEmployeeId(JobHistory jobHistory) {

        if ( jobHistory == null ) {
            return null;
        }
        Employee employee = jobHistory.getEmployee();
        if ( employee == null ) {
            return null;
        }
        Long id = employee.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private Long jobHistoryDepartmentId(JobHistory jobHistory) {

        if ( jobHistory == null ) {
            return null;
        }
        Department department = jobHistory.getDepartment();
        if ( department == null ) {
            return null;
        }
        Long id = department.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
