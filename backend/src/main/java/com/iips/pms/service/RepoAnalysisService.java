package com.iips.pms.service;

import com.iips.pms.entity.Project;
import com.iips.pms.entity.User;
import com.iips.pms.exception.ResourceNotFoundException;
import com.iips.pms.repository.CommitRecordRepository;
import com.iips.pms.repository.GuideAllocationRepository;
import com.iips.pms.repository.LinkedRepositoryRepository;
import com.iips.pms.repository.ProjectRepository;
import com.iips.pms.repository.SubmissionVersionRepository;
import com.iips.pms.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class RepoAnalysisService {

    private final ProjectRepository projectRepository;
    private final LinkedRepositoryRepository linkedRepository;
    private final CommitRecordRepository commitRepository;
    private final SubmissionVersionRepository versionRepository;
    private final GuideAllocationRepository allocationRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    public RepoAnalysisService(ProjectRepository projectRepository,
                           LinkedRepositoryRepository linkedRepository,
                           CommitRecordRepository commitRepository,
                           SubmissionVersionRepository versionRepository,
                           GuideAllocationRepository allocationRepository,
                           UserRepository userRepository,
                           RestTemplate restTemplate) {
        this.projectRepository = projectRepository;
        this.linkedRepository = linkedRepository;
        this.commitRepository = commitRepository;
        this.versionRepository = versionRepository;
        this.allocationRepository = allocationRepository;
        this.userRepository = userRepository;
        this.restTemplate = restTemplate;
    }

    public Map<String, Object> analyze(Long projectId, String callerEmail) {
        Project project = projectRepository.findById(projectId).orElseThrow(
                () -> new ResourceNotFoundException("Project not found: " + projectId));
        checkAccess(project, callerEmail);
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("projectId", projectId);
        report.put("title", project.getTitle());
        report.put("status", project.getStatus().name());

        var commits = commitRepository.findByProjectIdOrderByCommittedAtDesc(projectId);
        report.put("commitCount", commits.size());
        report.put("authors", commits.stream().map(c -> c.getAuthor() == null ? "unknown" : c.getAuthor())
                .distinct().toList());
        if (!commits.isEmpty() && commits.get(0).getCommittedAt() != null
                && commits.get(commits.size() - 1).getCommittedAt() != null) {
            long days = ChronoUnit.DAYS.between(
                    commits.get(commits.size() - 1).getCommittedAt(),
                    commits.get(0).getCommittedAt()) + 1;
            report.put("activeDays", days);
            report.put("commitsPerWeek",
                    commits.isEmpty() ? 0 : Math.round(commits.size() * 7.0 / Math.max(days, 1) * 10.0) / 10.0);
        } else {
            report.put("activeDays", 0);
            report.put("commitsPerWeek", 0);
        }
        report.put("uploadedVersions",
                versionRepository.findByProjectIdOrderByVersionNumberDesc(projectId).size());

        var link = linkedRepository.findByProjectId(projectId);
        report.put("repoLinked", link.isPresent());
        report.put("repoVerified", link.map(l -> l.isVerified()).orElse(false));
        if (link.isPresent()) {
            report.put("hasReadme", checkReadme(link.get().getRepoOwner(), link.get().getRepoName()));
            report.put("languages", fetchLanguages(link.get().getRepoOwner(), link.get().getRepoName()));
        } else {
            report.put("hasReadme", false);
            report.put("languages", Map.of());
        }
        return report;
    }

    private boolean checkReadme(String owner, String name) {
        try {
            restTemplate.headForHeaders(
                    "https://api.github.com/repos/" + owner + "/" + name + "/readme");
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Map<String, Object> fetchLanguages(String owner, String name) {
        try {
            String body = restTemplate.getForObject(
                    "https://api.github.com/repos/" + owner + "/" + name + "/languages", String.class);
            if (body == null) {
                return Map.of();
            }
            return new com.fasterxml.jackson.databind.ObjectMapper().readValue(body, Map.class);
        } catch (Exception e) {
            return Map.of();
        }
    }

    private void checkAccess(Project project, String callerEmail) {
        User caller = userRepository.findByEmail(callerEmail).orElseThrow(
                () -> new ResourceNotFoundException("User not found: " + callerEmail));
        boolean owner = project.getStudent().getEmail().equals(callerEmail);
        boolean guide = allocationRepository.findByProjectId(project.getId()).stream()
                .anyMatch(a -> a.getFaculty().getEmail().equals(callerEmail));
        boolean staff = "COORDINATOR".equals(caller.getRole()) || "ADMIN".equals(caller.getRole())
                || "EVALUATOR".equals(caller.getRole());
        if (!owner && !guide && !staff) {
            throw new IllegalStateException("You do not have access to this project");
        }
    }
}
