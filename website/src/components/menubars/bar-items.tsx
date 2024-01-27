import { CalendarIcon } from '../icons/calendar';
import { GlobeIcon } from '../icons/globe';
import { MapIcon } from '../icons/map';

export interface BarItemProps {
  title: string;
  icon: React.ReactNode;
  isActive: boolean;
  href: string;
}

export const barItems = [
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
