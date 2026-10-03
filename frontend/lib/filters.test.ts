import { describe, expect, it } from "vitest";
import { filterProjects, paginate, pageCount, bucketStatus, parseFacultyIds } from "./filters";

describe("parseFacultyIds", () => {
  it("parses comma separated ids and drops junk", () => {
    expect(parseFacultyIds("4, 7, abc, 0, -3")).toEqual([4, 7]);
    expect(parseFacultyIds("")).toEqual([]);
  });
});

const projects = [
  { id: 1, title: "Attendance", abstractText: "face recognition", techStack: "Next.js", status: "SUBMITTED" },
  { id: 2, title: "Library", abstractText: "catalog", techStack: "Spring", status: "APPROVED" },
  { id: 3, title: "Notice", abstractText: "board", techStack: "Next.js", status: "DRAFT" },
];

describe("bucketStatus", () => {
  it("maps statuses to buckets", () => {
    expect(bucketStatus("SUBMITTED")).toBe("REVIEWING");
    expect(bucketStatus("APPROVED")).toBe("DONE");
    expect(bucketStatus("DRAFT")).toBe("ACTIVE");
  });
});

describe("filterProjects", () => {
  it("filters by free text across title stack and abstract", () => {
    expect(filterProjects(projects, "spring", "ALL")).toHaveLength(1);
    expect(filterProjects(projects, "next.js", "ALL")).toHaveLength(2);
    expect(filterProjects(projects, "face", "ALL")).toHaveLength(1);
  });

  it("filters by status bucket", () => {
    expect(filterProjects(projects, "", "REVIEWING")).toHaveLength(1);
    expect(filterProjects(projects, "", "DONE")).toHaveLength(1);
  });

  it("combines query and bucket", () => {
    expect(filterProjects(projects, "next.js", "ACTIVE")).toHaveLength(1);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 20 }, (_, i) => i + 1);
  it("slices the requested page", () => {
    expect(paginate(items, 2, 8)).toHaveLength(8);
    expect(paginate(items, 3, 8)).toHaveLength(4);
  });
  it("computes page count", () => {
    expect(pageCount(20, 8)).toBe(3);
    expect(pageCount(0, 8)).toBe(1);
  });
});
