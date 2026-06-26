import { trackEvent } from '@/analytics';
import { Link, cn } from '@heroui/react';
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
    <Link
      href={href}
      onClick={() => {
        trackEvent(['sidebar'], { page: title });
      }}
    >
      <div
        className={cn(
          BarStyles.BarItem({ isActive }),
          'flex gap-3 items-center px-3 py-2 cursor-pointer relative',
        )}
      >
        <div className="text-inherit w-5 h-5 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-sm text-inherit">{title}</span>
        {showRedDot && (
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 absolute top-2 left-7" />
        )}
      </div>
    </Link>
  );
}
