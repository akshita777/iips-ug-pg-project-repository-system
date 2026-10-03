import { describe, expect, it } from "vitest";
import { formatDate, formatRelative, validateUpload, MAX_UPLOAD_MB } from "./format";

describe("formatDate", () => {
  it("returns dash for missing value", () => {
    expect(formatDate(undefined)).toBe("—");
  });

  it("returns the raw string when unparseable", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });

  it("formats a real timestamp", () => {
    const out = formatDate("2026-10-01T12:30:00Z");
    expect(out).toContain("2026");
  });
});

describe("formatRelative", () => {
  it("returns just now for fresh values", () => {
    expect(formatRelative(new Date().toISOString())).toBe("just now");
  });

  it("falls back to formatted date for old values", () => {
    const out = formatRelative("2025-01-01T00:00:00Z");
    expect(out).toContain("2025");
  });
});

describe("validateUpload", () => {
  it("rejects missing file", () => {
    expect(validateUpload(null)).toMatch(/Pick a file/);
  });

  it("rejects empty file", () => {
    const f = new File([], "a.zip");
    expect(validateUpload(f)).toMatch(/empty/);
  });

  it("rejects disallowed extension", () => {
    const f = new File(["x"], "evil.exe");
    expect(validateUpload(f)).toMatch(/Unsupported/);
  });

  it("accepts a zip under the size cap", () => {
    const f = new File(["x"], "report.zip");
    expect(validateUpload(f)).toBeNull();
    expect(MAX_UPLOAD_MB).toBeGreaterThan(0);
  });
});
