import { ENABLE_COFFEE } from '@/common/env';
import { BookOpenIcon } from '../icons/book-open';
import { CalendarIcon } from '../icons/calendar';
import { HelpCircleIcon } from '../icons/help-circle';
import { LayoutDashboardIcon } from '../icons/layout-dashboard';
import { MapIcon } from '../icons/map';
import { MessageCircleIcon } from '../icons/message-circle';
import { TrendingUpIcon } from '../icons/trending-up';
import { CoffeeItem } from './coffee-item';
import { ThemeToggleItem } from './theme-toggle-item';

export interface BarItemProps {
  title: string;
  icon: React.ReactNode;
  isActive: boolean;
  href: string;
  showRedDot?: boolean;
}

export const startBarItems = [
  {
    title: 'Dashboard',
    icon: <LayoutDashboardIcon />,
    href: '/',
  },
  {
    title: 'Route Explorer',
    icon: <MapIcon />,
    href: '/route',
  },
  {
    title: 'Trends',
    icon: <TrendingUpIcon />,
    href: '/trends',
  },
  {
    title: 'Monthly View',
    icon: <CalendarIcon />,
    href: '/month',
  },
];

export const endBarItems = [
  {
    title: 'Help',
    icon: <HelpCircleIcon color="" />,
    href: '/help',
  },
  {
    title: 'Changelog',
    icon: <BookOpenIcon />,
    href: '/changelog',
  },
  {
    title: 'Feedback',
    icon: <MessageCircleIcon />,
    href: '/feedback',
  },
];

export const additionalEndBarItems = [
  { key: 'coffee', item: <CoffeeItem />, disabled: !ENABLE_COFFEE },
  {
    key: 'themeToggle',
    item: <ThemeToggleItem />,
  },
].filter((item) => !item.disabled);
