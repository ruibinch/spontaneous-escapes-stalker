import { BookOpenIcon } from '../icons/book-open';
import { CalendarIcon } from '../icons/calendar';
import { CoffeeIcon } from '../icons/coffee';
import { GlobeIcon } from '../icons/globe';
import { HelpCircleIcon } from '../icons/help-circle';
import { MapIcon } from '../icons/map';
import { MessageCircleIcon } from '../icons/message-circle';
import { PieChartIcon } from '../icons/pie-chart';

export interface BarItemProps {
  title: string;
  icon: React.ReactNode;
  isActive: boolean;
  href: string;
}

export const startBarItems = [
  {
    title: 'Analysis',
    icon: <PieChartIcon />,
    href: '/analysis',
  },
  {
    title: 'Playground',
    icon: <GlobeIcon />,
    href: '/',
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
    icon: <HelpCircleIcon />,
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
