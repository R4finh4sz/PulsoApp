import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReportsContent } from '@/components/screens/Reports/ReportsContent';
import { ReportsHeader } from '@/components/screens/Reports/ReportsHeader';
import TabBar from '@/components/ui/TabBar';

const ReportsScreen = () => {
  const insets = useSafeAreaInsets();
  return (
    <>
      <ScrollView
        contentContainerStyle={{
          backgroundColor: '#F5F5F5',
          paddingTop: insets.top + 24,
          paddingHorizontal: 20,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: '100%', maxWidth: 560, alignSelf: 'center' }}>
          <ReportsHeader />

          <ReportsContent />
        </View>
      </ScrollView>

      <TabBar />
    </>
  );
};

export default ReportsScreen;
