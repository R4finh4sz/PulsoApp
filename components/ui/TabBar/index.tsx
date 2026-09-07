import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  type ParamListBase,
  useNavigation,
  useNavigationState,
} from '@react-navigation/native';
import { memo } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_LABELS, TAB_NAMES } from '@/utils/getTabBarIcons';

import Pressable from '../Pressable';
import { TabBarIcon } from '../TabBarIcon';

export type { ITab } from '@/utils/getTabBarIcons';

const TabBar = () => {
  const navigation = useNavigation<BottomTabNavigationProp<ParamListBase>>();
  const state = useNavigationState(navigationState => navigationState);
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center px-4"
      style={{
        backgroundColor: '#008CAB',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        paddingTop: 10,
        borderRadius: 16,
        paddingBottom: Math.max(insets.bottom, 16),
      }}
    >
      {TAB_NAMES.map(tabName => {
        const route = state.routes.find(
          item => item.name.replace(/\/index$/, '') === tabName,
        );
        if (!route) {
          return null;
        }
        const isFocused = state.routes[state.index]?.key === route.key;
        return (
          <View
            key={route.key}
            className="flex-1 items-center justify-center"
            style={{ transform: [{ translateY: -3 }] }}
          >
            <Pressable
              accessibilityLabel={TAB_LABELS[tabName]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              showFeedback={false}
              style={{
                width: 48,
                height: 48,
                flexShrink: 0,
                borderRadius: 24,
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isFocused ? '#0A718B' : 'transparent',
              }}
              onPress={() => {
                if (!isFocused) {
                  navigation.navigate(route.name, route.params);
                }
              }}
            >
              <TabBarIcon route={tabName} />
            </Pressable>
          </View>
        );
      })}
    </View>
  );
};
export default memo(TabBar);
