import { trackEvent } from '@/analytics';
import { cn } from '@heroui/react';
import NextLink from 'next/link';
import { BarItemProps } from './bar-items';
import { BarStyles } from './bar.styles';

export function SidebarItem({
  title,
  icon,
  isActive,
  href,
  showRedDot,
}: BarItemProps) {
  return (
    <NextLink
      href={href}
      prefetch={false}
      onClick={() => {
        trackEvent(['sidebar'], { page: title });
      }}
    >
      <div
        className={cn(
          BarStyles.BarItem({ isActive }),
          'flex gap-4 items-center px-3 py-2 rounded-md cursor-pointer transition-all duration-150 active:scale-[0.98] relative',
        )}
      >
        {showRedDot && (
          // slightly hacky implementation as can't get absolute positioning to work properly
          <div className="w-2 h-2 rounded-lg bg-red-600 -mr-4 -ml-2 mb-4" />
        )}
        <div className="text-inherit">{icon}</div>
        <span className="text-inherit">{title}</span>
      </div>
    </NextLink>
  );
}
