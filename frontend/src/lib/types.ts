// ============================================================
// Shared TypeScript types matching the Backend DTOs
// ============================================================

export type Role = "Admin" | "Teacher" | "Student";

export interface User {
  id: string;
  loginId: string;
  fullName: string;
  email: string;
  role: Role;
  classId: string | null;
  className: string | null;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  loginId: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  id: string;
  loginId: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface ClassItem {
  id: string;
  name: string;
  section: string | null;
  studentCount: number;
}

export interface SubjectItem {
  id: string;
  name: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string | null;
  deadline: string;
  maxMarks: number;
  status: "Draft" | "Published";
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  answer: string | null;
  submittedAt: string;
  marksObtained: number | null;
  feedback: string | null;
  status: "Submitted" | "Late" | "Graded";
  fileName: string | null;
  hasFile: boolean;
}

export interface LoginPayload {
  loginId: string;
  password: string;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  classId?: string | null;
}

export interface UpdateUserPayload {
  fullName: string;
  email: string;
  role: Role;
  classId?: string | null;
}

export interface CreateClassPayload {
  name: string;
  section?: string;
}

export interface CreateSubjectPayload {
  name: string;
  classId: string;
  teacherId: string;
}

export interface CreateAssignmentPayload {
  title: string;
  description: string;
  deadline: string;
  maxMarks: number;
  classId: string;
  subjectId: string;
}

export interface GradeSubmissionPayload {
  marksObtained: number;
  feedback: string;
}
