import { HelpCircleIcon } from '@/components/icons/help-circle';
import { cn } from '@nextui-org/react';
import { TooltipCustom } from '../tooltip-custom';

export function ChartWrapper({
  title,
  tooltip,
  chart,
  rightComponent,
  topRightComponent,
  topBarStyle,
  contentStyle,
}: {
  title: string;
  tooltip?: string;
  chart: React.ReactNode;
  rightComponent?: React.ReactNode;
  topRightComponent?: React.ReactNode;
  topBarStyle?: string;
  contentStyle?: string;
}) {
  return (
    <div className="flex flex-col gap-2 p-2 border border-neutral-250 dark:border-neutral-500 rounded-md">
      <div
        className={cn('flex justify-between gap-2 items-center', topBarStyle)}
      >
        <div className="flex gap-2 items-start">
          <span className="text-sm">{title}</span>

          {tooltip && (
            <TooltipCustom content={tooltip}>
              <div className="cursor-pointer">
                <HelpCircleIcon width={16} height={16} />
              </div>
            </TooltipCustom>
          )}
        </div>

        {topRightComponent && (
          <div className="justify-self-end">{topRightComponent}</div>
        )}
      </div>

      <div className={cn('flex', contentStyle)}>
        <div
          className={cn(
            'h-40 xl:h-48 overflow-hidden w-full',
            rightComponent ? '' : 'w-full',
          )}
        >
          {chart}
        </div>

        {rightComponent}
      </div>
    </div>
  );
}
