package com.iips.pms.storage;

import java.io.IOException;
import java.io.InputStream;

public interface FileStorage {

    String store(Long projectId, int versionNumber, String filename, byte[] content)
            throws IOException;

    InputStream load(String location) throws IOException;

    boolean exists(String location);
}
