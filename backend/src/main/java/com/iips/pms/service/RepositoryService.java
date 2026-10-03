package com.iips.pms.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iips.pms.entity.CommitRecord;
import com.iips.pms.entity.LinkedRepository;
import com.iips.pms.entity.Project;
import com.iips.pms.entity.Student;
import com.iips.pms.entity.User;
import com.iips.pms.exception.ResourceNotFoundException;
import com.iips.pms.repository.CommitRecordRepository;
import com.iips.pms.repository.LinkedRepositoryRepository;
import com.iips.pms.repository.ProjectRepository;
import com.iips.pms.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class RepositoryService {

    private static final Pattern URL_PATTERN =
            Pattern.compile("https://github\\.com/([\\w.-]+)/([\\w.-]+)/?");

    private final LinkedRepositoryRepository linkedRepository;
    private final CommitRecordRepository commitRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public RepositoryService(LinkedRepositoryRepository linkedRepository,
                             CommitRecordRepository commitRepository,
                             ProjectRepository projectRepository,
                             UserRepository userRepository,
                             RestTemplate restTemplate,
                             ObjectMapper objectMapper) {
        this.linkedRepository = linkedRepository;
        this.commitRepository = commitRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public LinkedRepository getLink(Long projectId) {
        return linkedRepository.findByProjectId(projectId).orElseThrow(
                () -> new ResourceNotFoundException("No repository linked to project: " + projectId));
    }

    @Transactional
    public LinkedRepository link(Long projectId, String callerEmail, String repoUrl) {
        Project project = findOwnedProject(projectId, callerEmail);
        Matcher matcher = URL_PATTERN.matcher(repoUrl.trim());
        if (!matcher.matches()) {
            throw new IllegalArgumentException("Repository URL must look like https://github.com/owner/name");
        }
        LinkedRepository link = linkedRepository.findByProjectId(projectId).orElseGet(LinkedRepository::new);
        link.setProject(project);
        link.setRepoUrl(repoUrl.trim());
        link.setRepoOwner(matcher.group(1));
        link.setRepoName(matcher.group(2).replaceAll("\\.git$", ""));
        link.setVerified(false);
        return linkedRepository.save(link);
    }

    @Transactional
    public List<CommitRecord> syncCommits(Long projectId, String callerEmail) {
        LinkedRepository link = getLink(projectId);
        findOwnedProject(projectId, callerEmail);
        String apiUrl = "https://api.github.com/repos/" + link.getRepoOwner()
                + "/" + link.getRepoName() + "/commits?per_page=30";
        ResponseEntity<String> response;
        try {
            response = restTemplate.getForEntity(apiUrl, String.class);
        } catch (HttpClientErrorException.NotFound e) {
            throw new IllegalArgumentException("GitHub repository not found or private: " + link.getRepoUrl());
        } catch (HttpClientErrorException.Forbidden e) {
            throw new IllegalStateException("GitHub rate limit reached, try again in a few minutes");
        } catch (Exception e) {
            throw new IllegalStateException("Could not reach GitHub: " + e.getMessage());
        }
        List<CommitRecord> saved = new ArrayList<>();
        try {
            JsonNode commits = objectMapper.readTree(response.getBody());
            Project project = link.getProject();
            for (JsonNode commit : commits) {
                String sha = commit.path("sha").asText();
                if (sha.isEmpty() || commitRepository.existsBySha(sha)) {
                    continue;
                }
                CommitRecord record = new CommitRecord();
                record.setProject(project);
                record.setSha(sha);
                record.setMessage(commit.path("commit").path("message").asText(""));
                record.setAuthor(commit.path("commit").path("author").path("name").asText("unknown"));
                String date = commit.path("commit").path("author").path("date").asText(null);
                if (date != null) {
                    record.setCommittedAt(OffsetDateTime.parse(date).toLocalDateTime());
                }
                saved.add(commitRepository.save(record));
            }
            link.setVerified(true);
            link.setLastSyncedAt(java.time.LocalDateTime.now());
            linkedRepository.save(link);
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("Could not parse GitHub response: " + e.getMessage());
        }
        return saved;
    }

    public List<CommitRecord> commits(Long projectId) {
        findProject(projectId);
        return commitRepository.findByProjectIdOrderByCommittedAtDesc(projectId);
    }

    public List<Map<String, String>> branches(Long projectId) {
        LinkedRepository link = getLink(projectId);
        String apiUrl = "https://api.github.com/repos/" + link.getRepoOwner()
                + "/" + link.getRepoName() + "/branches?per_page=30";
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(apiUrl, String.class);
            List<Map<String, String>> branches = new ArrayList<>();
            for (JsonNode branch : objectMapper.readTree(response.getBody())) {
                branches.add(Map.of(
                        "name", branch.path("name").asText(),
                        "sha", branch.path("commit").path("sha").asText("")));
            }
            return branches;
        } catch (HttpClientErrorException.NotFound e) {
            throw new IllegalArgumentException("GitHub repository not found or private: " + link.getRepoUrl());
        } catch (Exception e) {
            throw new IllegalStateException("Could not reach GitHub: " + e.getMessage());
        }
    }

    private Project findProject(Long id) {
        return projectRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Project not found: " + id));
    }

    private Project findOwnedProject(Long projectId, String callerEmail) {
        Project project = findProject(projectId);
        User caller = userRepository.findByEmail(callerEmail).orElseThrow(
                () -> new ResourceNotFoundException("User not found: " + callerEmail));
        if (!(caller instanceof Student) || !project.getStudent().getId().equals(caller.getId())) {
            throw new IllegalStateException("Only the owning student manages the linked repository");
        }
        return project;
    }
}
