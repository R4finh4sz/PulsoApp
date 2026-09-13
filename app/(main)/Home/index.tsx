import { router } from 'expo-router';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeHeader } from '@/components/screens/Home/HomeHeader';
import { HomePerformance } from '@/components/screens/Home/HomePerformance';
import { HomeSubjects } from '@/components/screens/Home/HomeSubjects';
import { HomeSummary } from '@/components/screens/Home/HomeSummary';
import { homeMock } from '@/components/screens/Home/mock';
import TabBar from '@/components/ui/TabBar';
import useAuth from '@/contexts/Auth/useAuth';
import { useStudentClassrooms } from '@/hooks/useStudentClassrooms';

const Home = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { refetch, isRefetching } = useStudentClassrooms();

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingHorizontal: 20,
          paddingBottom: 24,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetch();
            }}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: '100%', maxWidth: 560, alignSelf: 'center' }}>
          <HomeHeader name={user?.fullName ?? ''} />

          <HomePerformance percentage={homeMock.performance} />

          <HomeSummary
            completed={homeMock.completed}
            pending={homeMock.activities.length}
          />

          <HomeSubjects onViewAll={() => router.push('/(main)/Teams')} />
        </View>
      </ScrollView>

      <TabBar />
    </View>
  );
};

export default Home;
