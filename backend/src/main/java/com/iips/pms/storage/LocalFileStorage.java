package com.iips.pms.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

@Component
@ConditionalOnProperty(name = "storage.type", havingValue = "local", matchIfMissing = true)
public class LocalFileStorage implements FileStorage {

    private final Path root;

    public LocalFileStorage(@Value("${storage.local.path:./uploads}") String storagePath) {
        this.root = Path.of(storagePath);
    }

    @Override
    public String store(Long projectId, int versionNumber, String filename, byte[] content)
            throws IOException {
        String cleanName = Path.of(filename == null ? "upload.bin" : filename)
                .getFileName().toString();
        Path dir = root.resolve("project-" + projectId);
        Files.createDirectories(dir);
        Path target = dir.resolve("v" + versionNumber + "_" + cleanName);
        Files.write(target, content);
        return target.toString();
    }

    @Override
    public InputStream load(String location) throws IOException {
        return Files.newInputStream(Path.of(location));
    }

    @Override
    public boolean exists(String location) {
        return Files.isRegularFile(Path.of(location));
    }
}
