import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StudentClassrooms } from '@/components/screens/Teams/StudentClassrooms';
import { TeamsHeader } from '@/components/screens/Teams/TeamsHeader';
import TabBar from '@/components/ui/TabBar';
import { useStudentClassrooms } from '@/hooks/useStudentClassrooms';

const TeamsScreen = () => {
  const insets = useSafeAreaInsets();
  const { refetch, isRefetching } = useStudentClassrooms();
  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 24,
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
      >
        <View style={{ width: '100%', maxWidth: 560, alignSelf: 'center' }}>
          <TeamsHeader />

          <StudentClassrooms />
        </View>
      </ScrollView>

      <TabBar />
    </View>
  );
};
export default TeamsScreen;
