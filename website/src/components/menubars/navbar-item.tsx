import { trackEvent } from '@/analytics';
import { cn } from '@nextui-org/react';
import NextLink from 'next/link';
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
    <NextLink
      href={href}
      onClick={() => {
        trackEvent(['navbar'], { page: title });
      }}
    >
      <Tooltip size="lg" radius="sm" content={title} placement="bottom">
        <div className={cn(BarStyles.BarItem({ isActive }), 'p-2 rounded-md')}>
          {showRedDot && (
            // slightly hacky implementation as can't get absolute positioning to work properly
            <div className="w-2 h-2 rounded-lg bg-red-600 -mt-2 -ml-1" />
          )}
          <div className="text-inherit">{icon}</div>
        </div>
      </Tooltip>
    </NextLink>
  );
}
