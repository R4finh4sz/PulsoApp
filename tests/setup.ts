// Native animations and safe area measurements have no device runtime in Jest.
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

jest.mock('react-native-keyboard-controller', () => {
  const {
    View,
    ScrollView,
    KeyboardAvoidingView,
    useWindowDimensions,
  } = require('react-native');
  return {
    KeyboardProvider: View,
    KeyboardAwareScrollView: ScrollView,
    KeyboardAvoidingView,
    KeyboardController: { dismiss: jest.fn() },
    useWindowDimensions,
  };
});

jest.mock('expo-router', () => {
  const { createElement: makeElement, useEffect } = require('react');
  const { View, Text } = require('react-native');
  const Stack = Object.assign(View, {
    Screen: ({ name }: { name: string }) => makeElement(Text, null, name),
    Protected: ({ guard, children }: { guard: boolean; children: unknown }) =>
      guard ? children : null,
  });
  const router = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    dismissTo: jest.fn(),
    canGoBack: jest.fn(() => false),
  };
  return {
    router,
    useRouter: () => router,
    useLocalSearchParams: jest.fn(() => ({})),
    usePathname: jest.fn(() => '/Home'),
    useFocusEffect: useEffect,
    Stack,
    Tabs: Stack,
    Slot: View,
    Link: Text,
    Redirect: ({ href }: { href: string }) => makeElement(Text, null, href),
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({ navigate: jest.fn() })),
  useNavigationState: jest.fn(selector =>
    selector({
      index: 0,
      routes: ['Home', 'Teams', 'Quiz', 'Reports'].map(name => ({
        name,
        key: name,
      })),
    }),
  ),
}));
