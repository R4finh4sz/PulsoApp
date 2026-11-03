import { router } from 'expo-router';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeHeader } from '@/components/screens/Home/HomeHeader';
import { HomePerformance } from '@/components/screens/Home/HomePerformance';
import { HomeSchoolCourses } from '@/components/screens/Home/HomeSchoolCourses';
import { HomeSummary } from '@/components/screens/Home/HomeSummary';
import { homeMock } from '@/components/screens/Home/mock';
import Button from '@/components/ui/Button';
import TabBar from '@/components/ui/TabBar';
import useAuth from '@/contexts/Auth/useAuth';
import { useStudentActivities } from '@/hooks/useStudentActivities';
import { useStudentClassrooms } from '@/hooks/useStudentClassrooms';
import { isMockEnabled } from '@/services/mock';
import { summarizeActivities } from '@/utils/studentActivities';

const Home = () => {
  const activities = useStudentActivities();
  const summary = summarizeActivities(activities.data ?? []);
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
              activities.refetch();
            }}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: '100%', maxWidth: 560, alignSelf: 'center' }}>
          <HomeHeader name={user?.fullName ?? ''} />

          {!isMockEnabled && activities.isPending && (
            <ActivityIndicator
              accessibilityLabel="Carregando desempenho"
              color="#0095B3"
            />
          )}

          {activities.isError && (
            <>
              <Text>Não foi possível carregar o desempenho.</Text>

              <Button
                text="Tentar novamente"
                onPress={() => {
                  activities.refetch();
                }}
              />
            </>
          )}

          {(isMockEnabled || activities.isSuccess) && (
            <>
              <HomePerformance
                percentage={
                  isMockEnabled ? homeMock.performance : summary.percentage
                }
              />

              <HomeSummary
                completed={
                  isMockEnabled ? homeMock.completed : summary.completed
                }
                pending={
                  isMockEnabled ? homeMock.activities.length : summary.pending
                }
              />
            </>
          )}

          <HomeSchoolCourses onViewAll={() => router.push('/(main)/Teams')} />
        </View>
      </ScrollView>

      <TabBar />
    </View>
  );
};

export default Home;
