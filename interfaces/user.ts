export type TUser = {
  id: number;
  fullName: string;
  ra: string | null;
  email: string;
  role: 'ADMIN' | 'PEDAGOGICAL_COORDINATOR' | 'TEACHER' | 'STUDENT';
  classroomId: number | null;
};
