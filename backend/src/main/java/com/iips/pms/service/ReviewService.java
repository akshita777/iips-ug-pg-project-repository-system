package com.iips.pms.service;

import com.iips.pms.dto.ReviewRequest;
import com.iips.pms.entity.CodeReview;
import com.iips.pms.entity.Project;
import com.iips.pms.entity.User;
import com.iips.pms.exception.ResourceNotFoundException;
import com.iips.pms.repository.CodeReviewRepository;
import com.iips.pms.repository.GuideAllocationRepository;
import com.iips.pms.repository.ProjectRepository;
import com.iips.pms.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    private final CodeReviewRepository reviewRepository;
    private final ProjectRepository projectRepository;
    private final GuideAllocationRepository allocationRepository;
    private final UserRepository userRepository;

    public ReviewService(CodeReviewRepository reviewRepository,
                         ProjectRepository projectRepository,
                         GuideAllocationRepository allocationRepository,
                         UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.projectRepository = projectRepository;
        this.allocationRepository = allocationRepository;
        this.userRepository = userRepository;
    }

    public List<CodeReview> list(Long projectId) {
        findProject(projectId);
        return reviewRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
    }

    @Transactional
    public CodeReview create(Long projectId, String reviewerEmail, ReviewRequest req) {
        Project project = findProject(projectId);
        User reviewer = userRepository.findByEmail(reviewerEmail).orElseThrow(
                () -> new ResourceNotFoundException("User not found: " + reviewerEmail));
        boolean isGuide = allocationRepository.findByProjectId(projectId).stream()
                .anyMatch(a -> a.getFaculty().getEmail().equals(reviewerEmail));
        if (!isGuide && !"COORDINATOR".equals(reviewer.getRole()) && !"ADMIN".equals(reviewer.getRole())) {
            throw new IllegalStateException("Only the allocated guide can review this code");
        }
        CodeReview review = new CodeReview();
        review.setProject(project);
        review.setReviewer(reviewer);
        try {
            review.setStatus(CodeReview.ReviewStatus.valueOf(req.status().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Status must be PENDING, CHANGES_REQUESTED, or APPROVED");
        }
        review.setComments(req.comments());
        return reviewRepository.save(review);
    }

    private Project findProject(Long id) {
        return projectRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Project not found: " + id));
    }
}
