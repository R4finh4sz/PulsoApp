import { isAxiosError } from 'axios';

import api from '@/services/api';

export type Activity = {
  id: number;
  subjectId: number;
  classroomId: number;
  questionCount: number;
  closesAt: string | null;
  status: 'OPEN' | 'FINISHED';
};
export type Submission = {
  id: number;
  activityId: number;
  answers: number[];
  gradedAt: string | null;
  correctAnswers: number | null;
  questionCount: number;
  score: number | null;
  themePerformance: { theme: string; percentage: number }[];
};
export type StudentActivity = {
  activity: Activity;
  submission: Submission | null;
};
export type Quiz = {
  activity: Activity;
  questions: {
    id: number;
    question: string;
    options: string[];
    theme: string;
  }[];
};
export const activityService = {
  list: async () =>
    (await api.get<StudentActivity[]>('/student/activities')).data,
  quiz: async (id: string) =>
    (await api.get<Quiz>(`/activities/${id}/quiz`)).data,
  submit: async (id: string, answers: number[]) => {
    try {
      return (
        await api.post<Submission>(`/activities/${id}/submissions`, { answers })
      ).data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        const activities = await activityService.list();
        const submission = activities.find(
          item => String(item.activity.id) === id,
        )?.submission;
        // Só considera concluída se o servidor confirmar uma entrega existente.
        if (submission) return submission;
      }
      throw error;
    }
  },
  result: async (id: number) =>
    (await api.get<Submission>(`/submissions/${id}/result`)).data,
};
