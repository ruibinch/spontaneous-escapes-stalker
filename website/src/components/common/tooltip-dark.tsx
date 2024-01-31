import { Tooltip } from '@nextui-org/react';
import React from 'react';

export function TooltipDark({
  content,
  children,
  showArrow,
}: {
  content: string;
  children: React.ReactNode;
  showArrow?: boolean;
}) {
  return (
    <Tooltip
      content={content}
      radius="sm"
      classNames={{
        base: 'before:bg-neutral-600',
        content: 'bg-neutral-600 text-white',
      }}
      showArrow={showArrow}
    >
      {children}
    </Tooltip>
  );
}
