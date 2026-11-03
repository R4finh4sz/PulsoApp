import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileAccount } from '@/components/screens/Profile/ProfileAccount';
import { ProfileHeader } from '@/components/screens/Profile/ProfileHeader';
import { ProfileLogout } from '@/components/screens/Profile/ProfileLogout';
import { ProfileStudentData } from '@/components/screens/Profile/ProfileStudentData';
import Button from '@/components/ui/Button';
import { useStudentPhoto, useStudentProfile } from '@/hooks/useStudentProfile';

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const profile = useStudentProfile();
  const photo = useStudentPhoto();

  return (
    <View className="flex-1 bg-neutral-background">
      <ScrollView
        contentContainerClassName="grow px-[26px]"
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: Math.max(insets.bottom, 24) + 24,
        }}
        refreshControl={
          <RefreshControl
            refreshing={profile.isRefetching || photo.isRefetching}
            onRefresh={() => {
              profile.refetch();
              photo.refetch();
            }}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[560px] flex-1 self-center">
          <ProfileHeader />

          {photo.isError && (
            <View className="mb-5 gap-2">
              <Text accessibilityRole="alert">
                Não foi possível carregar a foto.
              </Text>

              <Button
                isLoading={photo.isFetching}
                text="Recarregar foto"
                onPress={() => {
                  photo.refetch();
                }}
              />
            </View>
          )}

          <ProfileStudentData />

          <ProfileAccount />

          <ProfileLogout />
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
