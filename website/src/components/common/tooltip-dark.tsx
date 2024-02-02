import { Tooltip, TooltipProps } from '@nextui-org/react';
import React from 'react';

export function TooltipDark(props: TooltipProps) {
  return (
    <Tooltip
      content={props.content}
      radius="sm"
      classNames={{
        base: 'before:bg-neutral-600',
        content: 'bg-neutral-600 text-white',
      }}
      showArrow={props.showArrow}
    >
      {props.children}
    </Tooltip>
  );
}
