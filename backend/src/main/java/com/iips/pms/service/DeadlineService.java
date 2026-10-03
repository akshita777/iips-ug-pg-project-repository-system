package com.iips.pms.service;

import com.iips.pms.dto.DeadlineRequest;
import com.iips.pms.entity.BatchMentor;
import com.iips.pms.entity.DeadlineWindow;
import com.iips.pms.entity.Project;
import com.iips.pms.entity.Student;
import com.iips.pms.entity.User;
import com.iips.pms.exception.ResourceNotFoundException;
import com.iips.pms.repository.BatchMentorRepository;
import com.iips.pms.repository.DeadlineWindowRepository;
import com.iips.pms.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DeadlineService {

    private final DeadlineWindowRepository windowRepository;
    private final BatchMentorRepository batchMentorRepository;
    private final UserRepository userRepository;

    public DeadlineService(DeadlineWindowRepository windowRepository,
                           BatchMentorRepository batchMentorRepository,
                           UserRepository userRepository) {
        this.windowRepository = windowRepository;
        this.batchMentorRepository = batchMentorRepository;
        this.userRepository = userRepository;
    }

    public List<DeadlineWindow> listForCaller(String callerEmail) {
        User caller = findUser(callerEmail);
        if (caller instanceof Student student) {
            return windowRepository.findByBatchMentorProgramCodeAndBatchMentorBatchYearAndProjectType(
                    student.getProgramCode(), student.getBatchYear(), Project.ProjectType.MINOR);
        }
        return windowRepository.findAll();
    }

    @Transactional
    public DeadlineWindow set(String callerEmail, DeadlineRequest req) {
        User caller = findUser(callerEmail);
        if (!"COORDINATOR".equals(caller.getRole()) && !"ADMIN".equals(caller.getRole())) {
            throw new IllegalStateException("Only the batch mentor sets deadlines");
        }
        if (!req.closesOn().isAfter(req.opensOn())) {
            throw new IllegalArgumentException("Closing time must be after opening time");
        }
        Project.ProjectType type;
        try {
            type = Project.ProjectType.valueOf(req.projectType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Project type must be MINOR or MAJOR");
        }
        BatchMentor assignment = batchMentorRepository.findByFacultyId(caller.getId())
                .stream().findFirst().orElse(null);
        DeadlineWindow window = new DeadlineWindow();
        if (assignment == null && caller instanceof com.iips.pms.entity.Coordinator) {
            throw new IllegalStateException("No batch assigned to this mentor yet");
        }
        if (assignment != null) {
            window.setBatchMentor(assignment);
        } else {
            window.setBatchMentor(batchMentorRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new IllegalStateException("No batch mentor exists yet")));
        }
        window.setProjectType(type);
        window.setOpensOn(req.opensOn());
        window.setClosesOn(req.closesOn());
        return windowRepository.save(window);
    }

    public void checkOpen(Student student, Project.ProjectType type) {
        List<DeadlineWindow> windows = windowRepository
                .findByBatchMentorProgramCodeAndBatchMentorBatchYearAndProjectType(
                        student.getProgramCode(), student.getBatchYear(), type);
        if (windows.isEmpty()) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        boolean open = windows.stream().anyMatch(w ->
                !now.isBefore(w.getOpensOn()) && !now.isAfter(w.getClosesOn()));
        if (!open) {
            throw new IllegalStateException("The submission window for this project type is closed");
        }
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email).orElseThrow(
                () -> new ResourceNotFoundException("User not found: " + email));
    }
}
