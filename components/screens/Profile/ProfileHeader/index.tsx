import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pencil } from 'lucide-react-native';
import { ActivityIndicator, Text, View } from 'react-native';

import { BackButton } from '@/components/ui/BackButton';
import ProfilePhotoPicker from '@/components/ui/ProfilePhotoPicker';
import { StudentAvatar } from '@/components/ui/StudentAvatar';
import useAuth from '@/contexts/Auth/useAuth';
import { useStudentProfile } from '@/hooks/useStudentProfile';
import { profileService } from '@/services/profile';
import { useErrorModal } from '@/store/errorModalStore';
import { formatName } from '@/utils/format';

export const ProfileHeader = () => {
  const { user: sessionUser } = useAuth();
  const client = useQueryClient();
  const upload = useMutation({
    mutationFn: profileService.updatePhoto,
    onSuccess: () =>
      client.invalidateQueries({
        queryKey: ['student-photo', sessionUser?.id],
      }),
    onError: error => useErrorModal.getState().openErrorFromException(error),
  });
  const { data } = useStudentProfile();
  const user = data?.user ?? sessionUser;
  const name = formatName(user?.fullName ?? '');
  const initials =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .filter((_, index, names) => index === 0 || index === names.length - 1)
      .map(part => part[0])
      .join('')
      .toUpperCase() || 'AL';

  return (
    <View>
      <BackButton
        onPress={() =>
          router.canGoBack() ? router.back() : router.replace('/(main)/Home')
        }
      />

      <View className="mb-9 mt-4 items-center">
        <View className="mb-3">
          <ProfilePhotoPicker
            disabled={upload.isPending}
            value={null}
            onChange={photo => {
              if (photo) {
                upload.mutate(photo);
              }
            }}
          >
            <View
              accessibilityLabel={`Perfil de ${name || 'aluno'}`}
              className="h-28 w-28 items-center justify-center rounded-full bg-[#DCE8EC]"
            >
              <StudentAvatar initials={initials} size={112} />

              <View className="absolute bottom-0 right-0 h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-[#006D83]">
                {upload.isPending ? (
                  <ActivityIndicator
                    accessibilityLabel="Salvando foto de perfil"
                    color="#FFFFFF"
                    size="small"
                  />
                ) : (
                  <Pencil color="#FFFFFF" size={18} strokeWidth={1.7} />
                )}
              </View>
            </View>
          </ProfilePhotoPicker>
        </View>

        <Text className="text-center font-poppins_medium text-sm text-[#4B5563]">
          {name}
        </Text>

        <Text className="mt-1 text-center font-poppins text-xs text-[#7D8592]">
          {user?.email}
        </Text>
      </View>
    </View>
  );
};
