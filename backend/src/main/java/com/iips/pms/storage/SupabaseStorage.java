package com.iips.pms.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;

@Component
@ConditionalOnProperty(name = "storage.type", havingValue = "supabase")
public class SupabaseStorage implements FileStorage {

    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final String serviceKey;
    private final String bucket;

    public SupabaseStorage(RestTemplate restTemplate,
                           @Value("${supabase.url:}") String baseUrl,
                           @Value("${supabase.service-key:}") String serviceKey,
                           @Value("${storage.bucket:project-files}") String bucket) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl == null ? "" : baseUrl.replaceAll("/+$", "");
        this.serviceKey = serviceKey;
        this.bucket = bucket;
    }

    @Override
    public String store(Long projectId, int versionNumber, String filename, byte[] content)
            throws IOException {
        requireConfig();
        String cleanName = Path.of(filename == null ? "upload.bin" : filename)
                .getFileName().toString();
        String objectPath = "project-" + projectId + "/v" + versionNumber + "_" + cleanName;
        HttpHeaders headers = headers("application/octet-stream");
        HttpEntity<byte[]> request = new HttpEntity<>(content, headers);
        ResponseEntity<String> response = restTemplate.exchange(
                baseUrl + "/storage/v1/object/" + bucket + "/" + objectPath,
                HttpMethod.PUT, request, String.class);
        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new IOException("Supabase upload failed with status " + response.getStatusCode());
        }
        return "supabase://" + bucket + "/" + objectPath;
    }

    @Override
    public InputStream load(String location) throws IOException {
        requireConfig();
        String objectPath = location.replaceFirst("^supabase://" + bucket + "/", "");
        HttpHeaders headers = authHeaders();
        HttpEntity<Void> request = new HttpEntity<>(headers);
        ResponseEntity<byte[]> response = restTemplate.exchange(
                baseUrl + "/storage/v1/object/" + bucket + "/" + objectPath,
                HttpMethod.GET, request, byte[].class);
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new IOException("Supabase download failed with status " + response.getStatusCode());
        }
        return new ByteArrayInputStream(response.getBody());
    }

    @Override
    public boolean exists(String location) {
        try {
            requireConfig();
            String objectPath = location.replaceFirst("^supabase://" + bucket + "/", "");
            HttpEntity<Void> request = new HttpEntity<>(authHeaders());
            ResponseEntity<String> response = restTemplate.exchange(
                    baseUrl + "/storage/v1/object/info/" + bucket + "/" + objectPath,
                    HttpMethod.GET, request, String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            return false;
        }
    }

    private void requireConfig() {
        if (baseUrl.isEmpty() || serviceKey.isEmpty()) {
            throw new IllegalStateException(
                    "Supabase storage needs SUPABASE_URL and SUPABASE_SERVICE_KEY set");
        }
    }

    private HttpHeaders authHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("apikey", serviceKey);
        headers.setBearerAuth(serviceKey);
        return headers;
    }

    private HttpHeaders headers(String contentType) {
        HttpHeaders headers = authHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        return headers;
    }
}
