import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { BackButton } from '@/components/ui/BackButton';
import useAuth from '@/contexts/Auth/useAuth';

export const ProfileHeader = () => {
  const { user } = useAuth();
  const initials =
    user?.fullName
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
          accessibilityLabel={`Perfil de ${user?.fullName || 'aluno'}`}
          className="mb-3 h-28 w-28 items-center justify-center rounded-full bg-[#DCE8EC]"
        >
          <Text className="font-poppins_medium text-4xl text-[#0095B3]">
            {initials}
          </Text>
        </View>

        <Text className="text-center font-poppins_medium text-sm text-[#4B5563]">
          {user?.fullName}
        </Text>

        <Text className="mt-1 text-center font-poppins text-xs text-[#7D8592]">
          {user?.email}
        </Text>
      </View>
    </View>
  );
};
