import { trackEvent } from '@/analytics';
import { Link, cn } from '@heroui/react';
import React from 'react';
import { Tooltip } from '../common/tooltip';
import { BarStyles } from './bar.styles';

interface Props {
  title: string;
  icon: React.ReactNode;
  isActive?: boolean;
  href?: string;
  showRedDot?: boolean;
}

export function NavbarItem({
  title,
  icon,
  isActive,
  href = '',
  showRedDot,
}: Props) {
  return (
    <Link
      href={href}
      onClick={() => {
        trackEvent(['navbar'], { page: title });
      }}
    >
      <Tooltip size="lg" radius="sm" content={title} placement="bottom">
        <div
          className={cn(
            BarStyles.BarItem({ isActive }),
            'p-2 rounded-lg relative',
          )}
        >
          <div className="text-inherit">{icon}</div>
          {showRedDot && (
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 absolute top-1 right-1" />
          )}
        </div>
      </Tooltip>
    </Link>
  );
}
