import { Button, Tooltip } from '@nextui-org/react';
import { RefreshIcon } from '../../icons/refresh';

export function ResetAllFiltersButton({
  resetAllFilters,
}: {
  resetAllFilters: () => void;
}) {
  return (
    <Tooltip content="Reset all filters" placement="bottom">
      <div
        className="border-1 text-lg bg-neutral-100 rounded-md p-1 cursor-pointer"
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
    </Tooltip>
  );
}
