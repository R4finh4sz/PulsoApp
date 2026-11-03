import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import useAuth from '@/contexts/Auth/useAuth';
import { classroomService } from '@/services/classrooms';

export const useStudentClassrooms = () => {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: [
      'student-classrooms',
      user?.id,
      user?.schoolId,
      user?.classroomId,
    ],
    enabled: !!user,
    queryFn: async () => {
      const classrooms = await classroomService.list();
      return Promise.all(
        classrooms.map(async classroom => ({
          ...classroom,
          schoolCourses: await classroomService.schoolCourses(classroom.id),
        })),
      );
    },
  });
  const { refetch } = query;
  useFocusEffect(
    useCallback(() => {
      if (user) {
        refetch({ cancelRefetch: false });
      }
    }, [user, refetch]),
  );
  return query;
};
