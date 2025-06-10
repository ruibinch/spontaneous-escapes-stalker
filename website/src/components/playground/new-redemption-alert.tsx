import { trackEvent } from '@/analytics';
import { getMonthsList } from '@/common/get-data-time-range';
import { yyyymmToDate } from '@/common/yyyymm-to-date';
import { Link } from '@heroui/react';
import { differenceInCalendarDays, format } from 'date-fns';
import { AlertNotification } from '../common/alert-notification';
import { CommonStyles } from '../common/styles';

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
    <AlertNotification
      title={'❗️ New redemption alert'}
      content={
        <span className="text-sm">
          {`Spontaneous Escapes redemptions released for `}
          <Link
            href={`/month/${latestMonth}`}
            size="sm"
            underline="always"
            onClick={() => {
              trackEvent(['playground', 'newRedemptionAlert']);
            }}
            className={CommonStyles.Link}
          >
            {format(yyyymmToDate(latestMonth), 'MMMM yyyy')}
          </Link>
        </span>
      }
    />
  );
}
