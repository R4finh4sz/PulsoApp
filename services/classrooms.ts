import api from '@/services/api';
import { isMockEnabled, mockClassrooms, mockSubjects } from '@/services/mock';

export type Classroom = {
  id: number;
  name: string;
  identifier: string;
  teacherIds: number[];
};
export type Subject = {
  id: number;
  name: string;
  classroomId: number;
  teacherId: number;
};
export const classroomService = {
  list: async () =>
    isMockEnabled
      ? mockClassrooms
      : (await api.get<Classroom[]>('/classrooms')).data,
  subjects: async (classroomId: number) =>
    isMockEnabled
      ? mockSubjects.filter(subject => subject.classroomId === classroomId)
      : (await api.get<Subject[]>(`/classrooms/${classroomId}/subjects`)).data,
};
