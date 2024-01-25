import { GlobeIcon } from '../icons/globe';
import { PieChartIcon } from '../icons/pie-chart';
import { CalendarIcon } from '../icons/calendar';
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
