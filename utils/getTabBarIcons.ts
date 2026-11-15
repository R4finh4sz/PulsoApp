import type { IconT } from '@/components/ui/IconComponent';

export const TAB_NAMES = ['Home', 'Teams', 'Quiz', 'Reports'] as const;
export type ITab = (typeof TAB_NAMES)[number];
export const TAB_LABELS: Record<ITab, string> = {
  Home: 'Início',
  Quiz: 'Quiz',
  Reports: 'Relatórios',
  Teams: 'Equipes',
};
const ICON_MAP: Record<ITab, IconT> = {
  Home: 'HouseIcon',
  Quiz: 'CheckListIcon',
  Reports: 'GraphicIcon',
  Teams: 'TeamsIcon',
};
export const isTabRoute = (route: string): route is ITab =>
  TAB_NAMES.some(tab => tab === route);
export const getTabBarIconName = (route: ITab): IconT => ICON_MAP[route];
