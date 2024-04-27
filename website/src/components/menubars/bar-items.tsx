import { ENABLE_COFFEE } from '@/common/env';
import { BookOpenIcon } from '../icons/book-open';
import { CalendarIcon } from '../icons/calendar';
import { GlobeIcon } from '../icons/globe';
import { HelpCircleIcon } from '../icons/help-circle';
import { MapIcon } from '../icons/map';
import { MessageCircleIcon } from '../icons/message-circle';
import { PieChartIcon } from '../icons/pie-chart';
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
    title: 'Playground',
    icon: <GlobeIcon />,
    href: '/',
  },
  {
    title: 'Analysis',
    icon: <PieChartIcon />,
    href: '/analysis',
  },
  {
    title: 'View by Month',
    icon: <CalendarIcon />,
    href: '/month',
  },
  {
    title: 'View by Route',
    icon: <MapIcon />,
    href: '/route',
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
  { key: 'themeToggle', item: <ThemeToggleItem /> },
].filter((item) => !item.disabled);
