import { UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import Image from '@/components/ui/Image';
import { useStudentPhoto } from '@/hooks/useStudentProfile';

export const StudentAvatar = ({
  size,
  initials,
}: {
  size: number;
  initials?: string;
}) => {
  const { data, isLoading } = useStudentPhoto();
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isLoading ? (
        <ActivityIndicator
          accessibilityLabel="Carregando foto de perfil"
          color={initials ? '#0095B3' : '#FFFFFF'}
        />
      ) : data && data !== failedPhoto ? (
        <Image
          withoutBackground
          accessible
          accessibilityLabel="Foto de perfil"
          cachePolicy="none"
          contentFit="cover"
          source={{ uri: data }}
          style={{ width: size, height: size }}
          onError={() => setFailedPhoto(data)}
        />
      ) : initials ? (
        <Text className="font-poppins_medium text-4xl text-[#0095B3]">
          {initials}
        </Text>
      ) : (
        <UserRound color="#FFFFFF" size={23} strokeWidth={1.7} />
      )}
    </View>
  );
};
