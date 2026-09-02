import '@/global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { setDefaultOptions } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Toast, { ErrorToast } from 'react-native-toast-message';

import DefaultModal from '@/components/ui/DefaultModal';
import { AuthProvider } from '@/contexts/authContext';
import { DefaultModalProvider } from '@/contexts/defaultModalContext';
import colors from '@/global/colors';
import useUpdate from '@/hooks/useUpdate';
import queryClient from '@/utils/queryClient';

export { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const toastConfig = {
  error: (props: any) => <ErrorToast {...props} text1NumberOfLines={2} />,
};

setDefaultOptions({ locale: ptBR });

SplashScreen.preventAutoHideAsync();

const App = () => {
  const isLoading = useUpdate();
  const { top, bottom, left, right } = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({});

  const isAppReady = !isLoading && fontsLoaded;

  if (!isAppReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider isAppReady={isAppReady}>
            <SafeAreaProvider>
              <DefaultModalProvider>
                <SafeAreaView style={{ flex: 1 }}>
                  <StatusBar style="auto" />

                  <Stack
                    screenOptions={{
                      animation: 'fade',
                      animationDuration: 300,
                      headerShown: false,
                      contentStyle: {
                        backgroundColor: colors.neutral.background,
                        paddingTop: top,
                        paddingBottom: bottom,
                        paddingLeft: left,
                        paddingRight: right,
                      },
                    }}
                  />

                  <DefaultModal />

                  <Toast config={toastConfig} />
                </SafeAreaView>
              </DefaultModalProvider>
            </SafeAreaProvider>
          </AuthProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
};

export default App;
