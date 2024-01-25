import { trackEvent } from '@/analytics';
import { Tooltip, cn } from '@nextui-org/react';
import clsx from 'clsx';
import NextLink from 'next/link';
import React from 'react';
import { BarStyles } from './bar.styles';

interface Props {
  title: string;
  icon: React.ReactNode;
  isActive?: boolean;
  href?: string;
}

export function NavbarItem({ title, icon, isActive, href = '' }: Props) {
  return (
    <NextLink
      href={href}
      onClick={() => {
        trackEvent(['navbar'], { page: title });
      }}
    >
      <Tooltip
        size="lg"
        radius="sm"
        content={title}
        placement="bottom"
        showArrow
      >
        <div
          className={cn(
            BarStyles.BarItem({ isActive }),
            'p-3 items-center cursor-pointer rounded-md',
          )}
        >
          <div className="text-inherit">{icon}</div>
        </div>
      </Tooltip>
    </NextLink>
  );
}
