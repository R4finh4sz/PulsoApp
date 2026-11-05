import api from '@/services/api';
import {
  isMockEnabled,
  mockClassrooms,
  mockSchoolCourses,
} from '@/services/mock';

export type Classroom = {
  id: number;
  name: string;
  identifier: string;
  teacherIds: number[];
};
export type SchoolCourse = {
  syllabus?: string | null;
  topics?: { title: string; description: string; references: string | null }[];
  teacherIds?: number[];
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
  schoolCourses: async (classroomId: number) =>
    isMockEnabled
      ? mockSchoolCourses.filter(
          schoolCourse => schoolCourse.classroomId === classroomId,
        )
      : (await api.get<SchoolCourse[]>(`/classrooms/${classroomId}/subjects`))
          .data,
};
