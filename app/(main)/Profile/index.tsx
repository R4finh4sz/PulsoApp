import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileAccount } from '@/components/screens/Profile/ProfileAccount';
import { ProfileHeader } from '@/components/screens/Profile/ProfileHeader';
import { ProfileLogout } from '@/components/screens/Profile/ProfileLogout';
import { ProfileStudentData } from '@/components/screens/Profile/ProfileStudentData';

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-neutral-background">
      <ScrollView
        contentContainerClassName="grow px-[26px]"
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: Math.max(insets.bottom, 24) + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[560px] flex-1 self-center">
          <ProfileHeader />

          <ProfileStudentData />

          <ProfileAccount />

          <ProfileLogout />
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
