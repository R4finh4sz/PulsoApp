import api from '@/services/api';

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
  list: async () => (await api.get<Classroom[]>('/classrooms')).data,
  subjects: async (classroomId: number) =>
    (await api.get<Subject[]>(`/classrooms/${classroomId}/subjects`)).data,
};
