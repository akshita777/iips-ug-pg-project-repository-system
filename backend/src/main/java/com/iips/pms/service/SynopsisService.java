package com.iips.pms.service;

import com.iips.pms.dto.SynopsisRequest;
import com.iips.pms.entity.Student;
import com.iips.pms.entity.Synopsis;
import com.iips.pms.entity.User;
import com.iips.pms.exception.ResourceNotFoundException;
import com.iips.pms.repository.GuideAllocationRepository;
import com.iips.pms.repository.SynopsisRepository;
import com.iips.pms.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SynopsisService {

    private final SynopsisRepository synopsisRepository;
    private final UserRepository userRepository;
    private final GuideAllocationRepository allocationRepository;

    public SynopsisService(SynopsisRepository synopsisRepository,
                           UserRepository userRepository,
                           GuideAllocationRepository allocationRepository) {
        this.synopsisRepository = synopsisRepository;
        this.userRepository = userRepository;
        this.allocationRepository = allocationRepository;
    }

    public List<Synopsis> mySynopses(String callerEmail) {
        User caller = findUser(callerEmail);
        return synopsisRepository.findByStudentIdOrderByCreatedAtDesc(caller.getId());
    }

    @Transactional
    public Synopsis create(String callerEmail, SynopsisRequest req) {
        Student student =findStudent(callerEmail);
        Synopsis synopsis = new Synopsis();
        synopsis.setStudent(student);
        synopsis.setTitle(req.title());
        synopsis.setSummary(req.summary());
        synopsis.setStatus(Synopsis.SynopsisStatus.DRAFT);
        return synopsisRepository.save(synopsis);
    }

    @Transactional
    public Synopsis submit(Long id, String callerEmail) {
        Synopsis synopsis = findOwned(id, callerEmail);
        if (synopsis.getStatus() != Synopsis.SynopsisStatus.DRAFT
                && synopsis.getStatus() != Synopsis.SynopsisStatus.RETURNED) {
            throw new IllegalStateException("Only draft or returned synopses can be submitted");
        }
        synopsis.setStatus(Synopsis.SynopsisStatus.SUBMITTED);
        return synopsisRepository.save(synopsis);
    }

    @Transactional
    public Synopsis decide(Long id, String reviewerEmail, boolean approved) {
        Synopsis synopsis = synopsisRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Synopsis not found: " + id));
        boolean isGuide = allocationRepository.findByStudentId(
                synopsis.getStudent().getId()).stream()
                .anyMatch(a -> a.getFaculty().getEmail().equals(reviewerEmail));
        User reviewer = findUser(reviewerEmail);
        boolean staff = "COORDINATOR".equals(reviewer.getRole()) || "ADMIN".equals(reviewer.getRole());
        if (!isGuide && !staff) {
            throw new IllegalStateException("Only the guide or coordinator decides a synopsis");
        }
        if (synopsis.getStatus() != Synopsis.SynopsisStatus.SUBMITTED) {
            throw new IllegalStateException("Only submitted synopses can be decided");
        }
        synopsis.setStatus(approved ? Synopsis.SynopsisStatus.APPROVED : Synopsis.SynopsisStatus.RETURNED);
        return synopsisRepository.save(synopsis);
    }

    public boolean hasApproved(Student student) {
        return synopsisRepository.findByStudentIdOrderByCreatedAtDesc(student.getId()).stream()
                .anyMatch(s -> s.getStatus() == Synopsis.SynopsisStatus.APPROVED);
    }

    private Synopsis findOwned(Long id, String callerEmail) {
        Synopsis synopsis = synopsisRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Synopsis not found: " + id));
        if (!synopsis.getStudent().getEmail().equals(callerEmail)) {
            throw new IllegalStateException("You can only change your own synopsis");
        }
        return synopsis;
    }

    private Student findStudent(String email) {
        User caller = findUser(email);
        if (!(caller instanceof Student student)) {
            throw new IllegalStateException("Only students write a synopsis");
        }
        return student;
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email).orElseThrow(
                () -> new ResourceNotFoundException("User not found: " + email));
    }
}
