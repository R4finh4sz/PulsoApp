import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TermsOfUseContent } from '@/components/screens/TermsOfUse/TermsOfUseContent';
import { TermsOfUseHeader } from '@/components/screens/TermsOfUse/TermsOfUseHeader';

const TermsOfUseScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-neutral-background">
      <ScrollView
        contentContainerClassName="grow px-5"
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[560px] self-center">
          <TermsOfUseHeader />

          <TermsOfUseContent />
        </View>
      </ScrollView>
    </View>
  );
};

export default TermsOfUseScreen;
