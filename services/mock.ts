import { TUser } from '@/interfaces/user';

import type { Classroom, Subject } from './classrooms';

export const isMockEnabled = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

export const mockUser: TUser = {
  id: 1,
  fullName: 'Rafael Souza',
  ra: '20250001',
  email: 'rafael@pulso.app',
  role: 'STUDENT',
  classroomId: 1,
};

export const mockClassrooms: Classroom[] = [
  {
    id: 1,
    name: '3º Ano B',
    identifier: '3B',
    teacherIds: [10, 11, 12],
  },
];

export const mockSubjects: Subject[] = [
  { id: 1, name: 'Matemática', classroomId: 1, teacherId: 10 },
  { id: 2, name: 'Português', classroomId: 1, teacherId: 11 },
  { id: 3, name: 'Química', classroomId: 1, teacherId: 12 },
];
