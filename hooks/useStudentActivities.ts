import { useQuery } from '@tanstack/react-query';

import useAuth from '@/contexts/Auth/useAuth';
import { activityService } from '@/services/activities';
import { isMockEnabled } from '@/services/mock';

export const useStudentActivities = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['student-activities', user?.id, user?.classroomId],
    enabled: !!user && !isMockEnabled,
    queryFn: activityService.list,
  });
};
