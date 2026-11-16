export type TUser = {
  id: number;
  fullName: string;
  ra: string | null;
  email: string;
  role: 'ADMIN' | 'PEDAGOGICAL_COORDINATOR' | 'TEACHER' | 'STUDENT';
  classroomId: number | null;
  schoolId?: number | null;
  termsAccepted?: boolean;
  birthDate?: string | null;
  status?: 'ACTIVE' | 'GRADUATED';
  /** Data da deliberação que formou o aluno (ISO). */
  graduatedAt?: string | null;
};
