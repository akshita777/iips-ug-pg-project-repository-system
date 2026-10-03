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
