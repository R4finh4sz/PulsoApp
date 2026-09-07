import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeActivities } from '@/components/screens/Home/HomeActivities';
import { HomeHeader } from '@/components/screens/Home/HomeHeader';
import { HomePerformance } from '@/components/screens/Home/HomePerformance';
import { HomeSummary } from '@/components/screens/Home/HomeSummary';
import { homeMock } from '@/components/screens/Home/mock';

const Home = () => {
  const insets = useSafeAreaInsets();

  const handleProfile = () => {
    // eslint-disable-next-line no-console
    console.log('Abrir perfil');
  };

  const handleViewAll = () => {
    // eslint-disable-next-line no-console
    console.log('Ver todas as atividades');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingHorizontal: 20,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: '100%', maxWidth: 560, alignSelf: 'center' }}>
          <HomeHeader name={homeMock.name} onProfile={handleProfile} />

          <HomePerformance percentage={homeMock.performance} />

          <HomeSummary
            completed={homeMock.completed}
            pending={homeMock.activities.length}
          />

          <HomeActivities
            activities={homeMock.activities}
            onViewAll={handleViewAll}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default Home;
