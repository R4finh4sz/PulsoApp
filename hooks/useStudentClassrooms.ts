import { useQuery } from '@tanstack/react-query';

import useAuth from '@/contexts/Auth/useAuth';
import { classroomService } from '@/services/classrooms';

export const useStudentClassrooms = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['student-classrooms', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const classrooms = await classroomService.list();
      return Promise.all(
        classrooms.map(async classroom => ({
          ...classroom,
          subjects: await classroomService.subjects(classroom.id),
        })),
      );
    },
  });
};
