import { router } from 'expo-router';
import { Dimensions, View } from 'react-native';
import Animated, { FadeIn, runOnJS, ZoomIn } from 'react-native-reanimated';


import Image from '@/components/ui/Image';
import { useAuth } from '@/contexts/Auth/useAuth';

const { height } = Dimensions.get('window');

const IntroScreen = () => {
  const { user, loading } = useAuth();
  const size = height * 1.2;

  const handleReplace = () => {
    if (loading) {
      return;
    }

    setTimeout(() => {
      if (user) {
        router.replace('/(main)/Home');
      } else {
        router.replace('/(auth)/Login?animateLogo=1');
      }
    }, 800);
  };

  return (
    <View className="flex-1 items-center justify-center bg-primary-100">
      <Animated.View
        className="absolute rounded-full bg-[#FDFDFD]"
        entering={ZoomIn.delay(200).duration(1200)}
        style={{
          width: size,
          height: size,
        }}
      />

      <Animated.View
        className="items-center justify-center"
        entering={FadeIn.delay(1500)
          .duration(1200)
          .withCallback(finished => {
            'worklet';

            if (finished) {
              runOnJS(handleReplace)();
            }
          })}
      >
        <Image
          contentFit="contain"
          source={require('@/assets/images/LogoImage.png')}
          style={{ width: 246, height: 248 }}
        />
      </Animated.View>
    </View>
  );
};

export default IntroScreen;
