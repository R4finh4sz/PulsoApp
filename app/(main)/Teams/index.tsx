import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { teamsMock } from '@/components/screens/Teams/mock';
import { TeamsHeader } from '@/components/screens/Teams/TeamsHeader';
import { TeamsJoinCard } from '@/components/screens/Teams/TeamsJoinCard';
import { TeamsSubjects } from '@/components/screens/Teams/TeamsSubjects';
import TabBar from '@/components/ui/TabBar';

const TeamsScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 24,
          paddingBottom: 24,
          backgroundColor: '#F5F5F5',
        }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        <View style={{ width: '100%', maxWidth: 560, alignSelf: 'center' }}>
          <TeamsHeader />

          <TeamsJoinCard />

          <TeamsSubjects subjects={teamsMock.subjects} />
        </View>
      </ScrollView>

      <TabBar />
    </View>
  );
};

export default TeamsScreen;
