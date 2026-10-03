package com.iips.pms.service;

import com.iips.pms.dto.BatchMentorRequest;
import com.iips.pms.entity.BatchMentor;
import com.iips.pms.entity.User;
import com.iips.pms.exception.ResourceNotFoundException;
import com.iips.pms.repository.BatchMentorRepository;
import com.iips.pms.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BatchMentorService {

    private final BatchMentorRepository batchMentorRepository;
    private final UserRepository userRepository;

    public BatchMentorService(BatchMentorRepository batchMentorRepository,
                              UserRepository userRepository) {
        this.batchMentorRepository = batchMentorRepository;
        this.userRepository = userRepository;
    }

    public List<BatchMentor> listAll() {
        return batchMentorRepository.findAll();
    }

    @Transactional
    public BatchMentor assign(BatchMentorRequest req) {
        User faculty = userRepository.findById(req.facultyId()).orElseThrow(
                () -> new ResourceNotFoundException("User not found: " + req.facultyId()));
        if (!batchMentorRepository.findByFacultyId(faculty.getId()).isEmpty()) {
            throw new IllegalStateException("This faculty already mentors another batch");
        }
        String programCode = req.programCode().toUpperCase();
        batchMentorRepository.findByProgramCodeAndBatchYear(programCode, req.batchYear())
                .ifPresent(existing -> {
                    throw new IllegalStateException("This batch already has a mentor");
                });
        BatchMentor assignment = new BatchMentor();
        assignment.setFaculty(faculty);
        assignment.setProgramCode(programCode);
        assignment.setBatchYear(req.batchYear());
        return batchMentorRepository.save(assignment);
    }
}
