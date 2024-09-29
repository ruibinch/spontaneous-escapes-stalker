import { Link, cn } from '@nextui-org/react';
import { getMonthsList } from '@/common/get-data-time-range';
import { yyyymmToDate } from '@/common/yyyymm-to-date';
import { differenceInCalendarDays, format } from 'date-fns';
import { trackEvent } from '@/analytics';

const NEW_REDEMPTION_WITHIN_NUM_DAYS = 7;

export function NewRedemptionAlert({
  latestRedemptionAt,
}: {
  latestRedemptionAt: Date;
}) {
  const isNewRedemption =
    differenceInCalendarDays(new Date(), new Date(latestRedemptionAt)) <=
    NEW_REDEMPTION_WITHIN_NUM_DAYS;

  if (!isNewRedemption) {
    return null;
  }

  const monthsList = getMonthsList();
  const latestMonth = monthsList[monthsList.length - 1];

  return (
    <div
      className={cn(
        'flex flex-col gap-2 p-3 rounded-md',
        'bg-amber-200/30 dark:bg-indigo-950',
        'border border-amber-300 dark:border-indigo-700',
      )}
    >
      <h2 className="font-semibold">❗️ New redemption alert</h2>

      <span className="text-sm">
        {`Spontaneous Escapes redemptions released for `}
        <Link
          href={`/month/${latestMonth}`}
          size="sm"
          underline="always"
          onClick={() => {
            trackEvent(['playground', 'newRedemptionAlert']);
          }}
          className="text-blue-500 dark:text-blue-400"
        >
          {format(yyyymmToDate(latestMonth), 'MMMM yyyy')}
        </Link>
      </span>
    </div>
  );
}
