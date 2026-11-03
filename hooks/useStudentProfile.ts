import { useQuery } from '@tanstack/react-query';

import useAuth from '@/contexts/Auth/useAuth';
import { profileService } from '@/services/profile';

export const useStudentProfile = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['student-profile', user?.id, user?.schoolId],
    enabled: !!user,
    queryFn: ({ signal }) => profileService.get(signal),
  });
};

export const useStudentPhoto = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['student-photo', user?.id],
    enabled: !!user,
    queryFn: ({ signal }) => profileService.photo(signal),
    staleTime: 60000,
    gcTime: 0,
  });
};
