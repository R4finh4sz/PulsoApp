import { getTabBarIconName, ITab } from '@/utils/getTabBarIcons';

import { IconComponent } from '../IconComponent';

type Props = { route: ITab };
export const TabBarIcon = ({ route }: Props) => (
  <IconComponent color="#FFFFFF" name={getTabBarIconName(route)} size={26} />
);
