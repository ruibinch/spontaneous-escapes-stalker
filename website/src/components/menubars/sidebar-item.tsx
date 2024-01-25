import { trackEvent } from '@/analytics';
import { cn } from '@nextui-org/react';
import NextLink from 'next/link';
import { BarItemProps } from './bar-items';
import { BarStyles } from './bar.styles';

export function SidebarItem({ title, icon, isActive, href }: BarItemProps) {
  return (
    <NextLink
      href={href}
      onClick={() => {
        trackEvent(['sidebar'], { page: title });
      }}
    >
      <div
        className={cn(
          BarStyles.BarItem({ isActive }),
          'flex gap-4 items-center px-3 py-2 rounded-md cursor-pointer transition-all duration-150 active:scale-[0.98]',
        )}
      >
        <div className="text-inherit">{icon}</div>
        <span className="text-inherit">{title}</span>
      </div>
    </NextLink>
  );
}
