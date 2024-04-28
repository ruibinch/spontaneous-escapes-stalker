import { useWindowSize } from '@/hooks/use-window-size';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipProps,
} from '@nextui-org/react';
import React from 'react';
import { BREAKPOINTS } from './breakpoints';

type Props = Omit<TooltipProps, 'content'> & {
  content: string;
  // use when rendering with Popover results in weird layout issues
  alwaysUseTooltip?: boolean;
};

export function TooltipCustom(props: Props) {
  const windowSize = useWindowSize();

  // don't render tooltip if content is empty
  if (!props.content) {
    return props.children;
  }

  if (
    windowSize.width !== undefined &&
    windowSize.width < BREAKPOINTS.sm &&
    !props.alwaysUseTooltip
  ) {
    return (
      <Popover
        radius="sm"
        classNames={{
          base: 'before:bg-neutral-600',
          content: 'bg-neutral-600 text-white',
        }}
        showArrow={props.showArrow}
      >
        <PopoverTrigger>{props.children}</PopoverTrigger>
        <PopoverContent>
          <span>{props.content}</span>
        </PopoverContent>
      </Popover>
    );
  }

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
