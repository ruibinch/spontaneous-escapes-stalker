import { useWindowSize } from '@/hooks/use-window-size';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipProps,
} from '@heroui/react';
import React from 'react';
import { BREAKPOINTS } from './breakpoints';

type Props = Omit<TooltipProps, 'content'> & {
  content: string;
};

/**
 * Use Tooltip when we always want to show a tooltip.
 * Use TooltipOrPopover when we want to show a tooltip on hover on desktop, and a popover on click on mobile.
 */
export function TooltipOrPopover(props: Props) {
  const windowSize = useWindowSize();

  if (!props.content) {
    return props.children;
  }

  if (windowSize.width !== undefined && windowSize.width < BREAKPOINTS.sm) {
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
