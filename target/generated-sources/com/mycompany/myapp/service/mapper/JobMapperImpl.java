package com.mycompany.myapp.service.mapper;

import com.mycompany.myapp.domain.Employee;
import com.mycompany.myapp.domain.Job;
import com.mycompany.myapp.domain.Task;
import com.mycompany.myapp.service.dto.JobDTO;
import com.mycompany.myapp.service.dto.TaskDTO;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import javax.annotation.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2017-03-04T03:18:44+0200",
    comments = "version: 1.0.0.Final, compiler: javac, environment: Java 1.8.0_111 (Oracle Corporation)"
)
@Component
public class JobMapperImpl implements JobMapper {

    @Autowired
    private TaskMapper taskMapper;

    @Override
    public JobDTO jobToJobDTO(Job job) {
        if ( job == null ) {
            return null;
        }

        JobDTO jobDTO = new JobDTO();

        jobDTO.setEmployeeId( jobEmployeeId( job ) );
        jobDTO.setId( job.getId() );
        jobDTO.setJobTitle( job.getJobTitle() );
        jobDTO.setMinSalary( job.getMinSalary() );
        jobDTO.setMaxSalary( job.getMaxSalary() );
        jobDTO.setTasks( taskSetToTaskDTOSet( job.getTasks() ) );

        return jobDTO;
    }

    @Override
    public List<JobDTO> jobsToJobDTOs(List<Job> jobs) {
        if ( jobs == null ) {
            return null;
        }

        List<JobDTO> list = new ArrayList<JobDTO>();
        for ( Job job : jobs ) {
            list.add( jobToJobDTO( job ) );
        }

        return list;
    }

    @Override
    public Job jobDTOToJob(JobDTO jobDTO) {
        if ( jobDTO == null ) {
            return null;
        }

        Job job = new Job();

        job.setEmployee( employeeFromId( jobDTO.getEmployeeId() ) );
        job.setId( jobDTO.getId() );
        job.setJobTitle( jobDTO.getJobTitle() );
        job.setMinSalary( jobDTO.getMinSalary() );
        job.setMaxSalary( jobDTO.getMaxSalary() );
        job.setTasks( taskDTOSetToTaskSet( jobDTO.getTasks() ) );

        return job;
    }

    @Override
    public List<Job> jobDTOsToJobs(List<JobDTO> jobDTOs) {
        if ( jobDTOs == null ) {
            return null;
        }

        List<Job> list = new ArrayList<Job>();
        for ( JobDTO jobDTO : jobDTOs ) {
            list.add( jobDTOToJob( jobDTO ) );
        }

        return list;
    }

    private Long jobEmployeeId(Job job) {

        if ( job == null ) {
            return null;
        }
        Employee employee = job.getEmployee();
        if ( employee == null ) {
            return null;
        }
        Long id = employee.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    protected Set<TaskDTO> taskSetToTaskDTOSet(Set<Task> set) {
        if ( set == null ) {
            return null;
        }

        Set<TaskDTO> set_ = new HashSet<TaskDTO>();
        for ( Task task : set ) {
            set_.add( taskMapper.taskToTaskDTO( task ) );
        }

        return set_;
    }

    protected Set<Task> taskDTOSetToTaskSet(Set<TaskDTO> set) {
        if ( set == null ) {
            return null;
        }

        Set<Task> set_ = new HashSet<Task>();
        for ( TaskDTO taskDTO : set ) {
            set_.add( taskMapper.taskDTOToTask( taskDTO ) );
        }

        return set_;
    }
}
