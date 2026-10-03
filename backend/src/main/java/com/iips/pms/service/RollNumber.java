package com.iips.pms.service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class RollNumber {

    private static final Pattern PATTERN =
            Pattern.compile("^([A-Z]{2})2[Kk](\\d{2})-(\\d{1,3})$");

    private RollNumber() {}

    public record Parsed(String normalized, String programCode, int batchYear, String serial) {}

    public static Parsed parse(String raw) {
        if (raw == null) {
            throw new IllegalArgumentException("Roll number is required for students");
        }
        Matcher matcher = PATTERN.matcher(raw.trim().toUpperCase());
        if (!matcher.matches()) {
            throw new IllegalArgumentException(
                    "Roll number must look like IC2K22-12");
        }
        String programCode = matcher.group(1);
        if (!"IC".equals(programCode)) {
            throw new IllegalArgumentException("Only IC program codes are accepted right now");
        }
        int batchYear = 2000 + Integer.parseInt(matcher.group(2));
        String normalized = matcher.group(0).replace("2K", "2k");
        return new Parsed(normalized, programCode, batchYear, matcher.group(3));
    }

    public static String sectionFor(String name, String override) {
        if (override != null && (override.equalsIgnoreCase("A") || override.equalsIgnoreCase("B"))) {
            return override.toUpperCase();
        }
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Name is required to derive the section");
        }
        char first = Character.toUpperCase(name.trim().charAt(0));
        return first >= 'A' && first <= 'M' ? "A" : "B";
    }
}
