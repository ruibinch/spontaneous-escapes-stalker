import { Tooltip as NextUITooltip, TooltipProps } from '@heroui/react';

type Props = Omit<TooltipProps, 'content'> & {
  content: string;
};

/**
 * Use Tooltip when we always want to show a tooltip.
 * Use TooltipOrPopover when we want to show a tooltip on hover on desktop, and a popover on click on mobile.
 */
export function Tooltip(props: Props) {
  if (!props.content) {
    return props.children;
  }

  return (
    <NextUITooltip
      content={props.content}
      radius="sm"
      classNames={{
        base: 'before:bg-neutral-600',
        content: 'bg-neutral-600 text-white',
      }}
      showArrow={props.showArrow}
    >
      {props.children}
    </NextUITooltip>
  );
}
