/** Split a comma separated faculty id list into a rank ordered array of ids. */
export function parseFacultyIds(raw: string): number[] {
  return raw
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
}

export type ProjectFilter = "ALL" | "ACTIVE" | "REVIEWING" | "DONE";

const REVIEWING = new Set(["SUBMITTED", "UNDER_REVIEW", "EVALUATION_PENDING"]);
const DONE = new Set(["APPROVED", "REJECTED", "EVALUATED", "ARCHIVED"]);

/** Bucket a project status into the filter vocabulary used by the list view. */
export function bucketStatus(status: string): "ACTIVE" | "REVIEWING" | "DONE" {
  if (REVIEWING.has(status)) return "REVIEWING";
  if (DONE.has(status)) return "DONE";
  return "ACTIVE";
}

/** Filter projects by free text title/abstract/stack plus a status bucket. */
export function filterProjects<T extends { title: string; abstractText?: string; techStack?: string; status: string }>(
  projects: T[],
  query: string,
  bucket: ProjectFilter
): T[] {
  const q = query.trim().toLowerCase();
  return projects.filter((p) => {
    if (bucket !== "ALL" && bucketStatus(p.status) !== bucket) return false;
    if (!q) return true;
    const hay = `${p.title} ${p.abstractText ?? ""} ${p.techStack ?? ""}`.toLowerCase();
    return hay.includes(q);
  });
}

/** Slice a list into pages with a fixed page size. */
export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (Math.max(page, 1) - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function pageCount(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}
