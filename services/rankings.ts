import { rankingMock } from '@/components/screens/Ranking/mock';
import api from '@/services/api';
import { isMockEnabled } from '@/services/mock';

export type StudentRanking = {
  position: number;
  studentId: number;
  studentName: string;
  totalActivities: number;
  totalScore: number;
  averageScore: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracyPercentage: number;
};

export const rankingService = {
  list: async (
    params: { year: number; bimester: number; schoolId?: number },
    signal?: AbortSignal,
  ): Promise<StudentRanking[]> =>
    isMockEnabled
      ? rankingMock.map((student, index) => ({
          position: index + 1,
          studentId: student.id,
          studentName: student.name,
          totalActivities: student.activities,
          totalScore: student.accuracy * student.activities,
          averageScore: student.accuracy,
          correctAnswers: student.accuracy,
          totalQuestions: 100,
          accuracyPercentage: student.accuracy,
        }))
      : (
          await api.get<StudentRanking[]>('/rankings/students', {
            params,
            signal,
          })
        ).data,
};
