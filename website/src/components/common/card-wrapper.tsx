import { HelpCircleIcon } from '@/components/icons/help-circle';
import { cn } from '@nextui-org/react';
import { TooltipOrPopover } from './tooltip-or-popover';
import { CommonStyles } from './styles';

/**
 * Common card wrapper that accepts either:
 * - chart (comes with a pre-determined height)
 * - any other content
 */
export function CardWrapper({
  title,
  subtitle,
  tooltip,
  chart,
  chartRightComponent,
  content,
  topRightComponent,
  style,
  headerStyle,
  contentStyle,
  chartComponentStyle,
}: {
  title?: string;
  subtitle?: string;
  tooltip?: string;
  chart?: React.ReactNode;
  chartRightComponent?: React.ReactNode;
  content?: React.ReactNode;
  topRightComponent?: React.ReactNode;
  style?: string;
  headerStyle?: string;
  contentStyle?: string;
  chartComponentStyle?: string;
}) {
  return (
    <div className={cn(CommonStyles.CardWrapper, style)}>
      <div className="flex justify-between gap-2 items-center">
        <div className={cn('flex gap-2 items-start', headerStyle)}>
          {title && <span className="text-sm">{title}</span>}

          {subtitle && <span className="text-2xs italic">{subtitle}</span>}

          {tooltip && (
            <TooltipOrPopover content={tooltip}>
              <div className="cursor-pointer">
                <HelpCircleIcon width={16} height={16} />
              </div>
            </TooltipOrPopover>
          )}
        </div>

        {topRightComponent && (
          <div className="justify-self-end">{topRightComponent}</div>
        )}
      </div>

      <div className={cn('flex', contentStyle)}>
        {chart && (
          <>
            <div
              className={cn(
                'h-40 xl:h-48 overflow-hidden w-full',
                chartRightComponent ? '' : 'w-full',
                chartComponentStyle,
              )}
            >
              {chart}
            </div>

            {chartRightComponent}
          </>
        )}

        {content}
      </div>
    </div>
  );
}
