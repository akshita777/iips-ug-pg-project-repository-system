export type Role = "STUDENT" | "FACULTY" | "COORDINATOR" | "EVALUATOR" | "ADMIN";

export interface AuthResponse {
  token: string;
  refreshToken: string;
  email: string;
  role: Role;
}

export type ProjectStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "EVALUATION_PENDING"
  | "EVALUATED"
  | "ARCHIVED";

export interface Project {
  id: number;
  title: string;
  abstractText?: string;
  techStack?: string;
  status: ProjectStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubmissionVersion {
  id: number;
  projectId: number;
  versionNumber: number;
  filePath: string;
  comments?: string;
  uploadedAt?: string;
}

export interface GuideAllocation {
  id: number;
  studentId?: number;
  studentEmail?: string;
  studentName?: string;
  facultyId?: number;
  facultyName?: string;
  projectId?: number;
  projectTitle?: string;
  status?: string;
}

export interface Evaluation {
  id: number;
  projectId: number;
  projectTitle?: string;
  rubricId?: number;
  totalMarks?: number;
  feedback?: string;
  createdAt?: string;
}

export interface Rubric {
  id: number;
  name: string;
  maxMarks?: number;
  criteria?: string;
}

export interface CodeReview {
  id: number;
  projectId?: number;
  status: string;
  comments?: string;
  createdAt?: string;
}

export interface CommitRecord {
  id: number;
  sha?: string;
  message?: string;
  author?: string;
  committedAt?: string;
}

export interface LinkedRepository {
  id: number;
  repoUrl: string;
  branch?: string;
}

export interface TeamMember {
  id: number;
  studentId: number;
  studentName?: string;
  teamRole: string;
}

export interface WikiPage {
  id: number;
  title: string;
  body?: string;
  updatedAt?: string;
}

export interface UserRow {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface AppNotification {
  id: number;
  title?: string;
  message?: string;
  read?: boolean;
  createdAt?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null) {
    const data = (error as { response?: { data?: { message?: string } }; message?: string }).response?.data
      ?? (error as { message?: string });
    if (typeof (data as { message?: string }).message === "string") {
      return (data as { message: string }).message;
    }
  }
  return fallback;
}
