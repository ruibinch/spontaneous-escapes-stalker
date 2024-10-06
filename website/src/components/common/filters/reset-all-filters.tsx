import { Button, cn } from '@nextui-org/react';
import { RefreshIcon } from '../../icons/refresh';
import { TooltipOrPopover } from '../tooltip-or-popover';
import { CommonStyles } from '../styles';

export function ResetAllFiltersButton({
  resetAllFilters,
}: {
  resetAllFilters: () => void;
}) {
  return (
    <TooltipOrPopover content="Reset all filters" placement="bottom">
      <div
        className={cn(
          CommonStyles.Border,
          'border-1 text-lg bg-neutral-100 dark:bg-neutral-600 rounded-md p-1 cursor-pointer',
        )}
        onClick={resetAllFilters}
      >
        <Button
          size="sm"
          variant="light"
          isIconOnly
          className="pointer-events-none"
        >
          <RefreshIcon />
        </Button>
      </div>
    </TooltipOrPopover>
  );
}
