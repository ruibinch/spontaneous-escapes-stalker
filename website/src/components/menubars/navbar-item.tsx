import { trackEvent } from '@/analytics';
import { cn } from '@nextui-org/react';
import NextLink from 'next/link';
import React from 'react';
import { TooltipCustom } from '../common/tooltip-custom';
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
      <TooltipCustom
        size="lg"
        radius="sm"
        content={title}
        placement="bottom"
        showArrow
      >
        <div className={cn(BarStyles.BarItem({ isActive }), 'p-2 rounded-md')}>
          <div className="text-inherit">{icon}</div>
        </div>
      </TooltipCustom>
    </NextLink>
  );
}
