export interface User {
  id: string;
  name: string;
  email: string;
}

// Const object + companion type — avoids enum restrictions under erasableSyntaxOnly
export const JobStatus = {
  Pending: 'pending',
  InProgress: 'in-progress',
  Completed: 'completed',
} as const;
export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

export interface Job {
  _id: string;
  title: string;
  description: string;
  status: JobStatus;
  aiSummary: string | null;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
}
