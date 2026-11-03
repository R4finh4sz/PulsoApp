import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { BackButton } from '@/components/ui/BackButton';
import { StudentAvatar } from '@/components/ui/StudentAvatar';
import { useStudentProfile } from '@/hooks/useStudentProfile';
import useAuth from '@/contexts/Auth/useAuth';
import { formatName } from '@/utils/format';

export const ProfileHeader = () => {
  const { user: sessionUser } = useAuth();
  const { data } = useStudentProfile();
  const user = data?.user ?? sessionUser;
  const name = formatName(user?.fullName ?? '');
  const initials =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .filter((_, index, names) => index === 0 || index === names.length - 1)
      .map(name => name[0])
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
        <View
          accessibilityLabel={`Perfil de ${name || 'aluno'}`}
          className="mb-3 h-28 w-28 items-center justify-center rounded-full bg-[#DCE8EC]"
        >
          <StudentAvatar size={112} initials={initials} />
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
