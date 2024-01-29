import { HelpCircleIcon } from '@/components/icons/help-circle';
import { Tooltip, cn } from '@nextui-org/react';

export function ChartWrapper({
  title,
  tooltip,
  chart,
  rightComponent,
  contentStyle,
}: {
  title: string;
  tooltip?: string;
  chart: React.ReactNode;
  rightComponent?: React.ReactNode;
  contentStyle?: string;
}) {
  return (
    <div className="flex flex-col gap-2 border border-neutral-250 p-2 rounded-md">
      <div className="flex gap-2 items-center">
        <span className="text-sm">{title}</span>

        {tooltip && (
          <Tooltip
            content={tooltip}
            radius="sm"
            classNames={{
              content: 'bg-neutral-600 text-white',
            }}
          >
            <div className="cursor-pointer">
              <HelpCircleIcon width={16} height={16} color="#404040" />
            </div>
          </Tooltip>
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
