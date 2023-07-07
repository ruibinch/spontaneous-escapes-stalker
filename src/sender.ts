import { escapeCharacters } from './lib/telegram/helpers';
import { sendMessage } from './lib/telegram/methods';
import { Redemption } from './models/Redemption';
import { FlightClass, TimePeriod } from './types';
import { formatDateDisplay, notEmpty } from './utils';

const CHANNEL_ID = '-1001889957472'; // FishSoupChannel

export async function sendMessageToChannel(message: string) {
  await sendMessage({
    chatId: CHANNEL_ID,
    message,
  });
}

export async function sendNewRedemptionPeriodNotification() {
  await sendMessageToChannel('‼️ *New redemptions available* ‼️');
}

export async function sendExistingRedemptionPeriodChangesNotification() {
  await sendMessageToChannel('‼️ *Changes to existing redemption period* ‼️');
}

export async function sendRedemptionsInfoNotification({
  redemptions,
  redemptionEndDate,
  travelPeriod,
}: {
  redemptions: Redemption[];
  redemptionEndDate: Date;
  travelPeriod: TimePeriod;
}) {
  const redemptionsSorted = sortRedemptionsByClass(redemptions);

  const generateRedemptionsInfo = (flightClass: FlightClass) => {
    const redemptionsForFlightClass = redemptionsSorted.filter(
      (r) => r.flightClass === flightClass,
    );
    if (redemptionsForFlightClass.length === 0) return undefined;

    const redemptionsInfoForFlightClass = redemptionsForFlightClass
      .map(({ origin, destination, milesRequired }) => {
        // consider IATA codes
        return escapeCharacters(
          `· ${origin} - ${destination}; ${milesRequired.toLocaleString()}`,
        );
      })
      .join('\n');

    return `*${flightClass}*\n${redemptionsInfoForFlightClass}`;
  };

  const redemptionTerms = [
    `Valid for travel from *${formatDateDisplay(
      travelPeriod.from,
    )} to ${formatDateDisplay(travelPeriod.to)}*`,
    `Redemption ends on ${formatDateDisplay(redemptionEndDate)}`,
  ].join('\n');

  const redemptionsInfo = [
    redemptionTerms,
    generateRedemptionsInfo(FlightClass.ECONOMY),
    generateRedemptionsInfo(FlightClass.PREMIUM_ECONOMY),
    generateRedemptionsInfo(FlightClass.BUSINESS),
  ]
    .filter(notEmpty)
    .join('\n\n');

  await sendMessage({
    chatId: CHANNEL_ID,
    message: redemptionsInfo,
  });
}

/**
 * Sort by:
 * 1. Flight class
 * 2. Region
 * 3. Miles required
 * // TODO: consider another level of sorting
 */
function sortRedemptionsByClass(redemptions: Redemption[]) {
  const FLIGHT_CLASS_SORT_ORDER = [
    FlightClass.ECONOMY,
    FlightClass.PREMIUM_ECONOMY,
    FlightClass.BUSINESS,
    FlightClass.FIRST,
  ];
  // TODO: convert to Region enum
  const REGION_SORT_ORDER = [
    'South East Asia',
    'North Asia',
    'West Asia & Africa',
    'Australia',
    'Southwest Pacific',
    'Europe',
    'USA',
  ];

  return [...redemptions].sort((a, b) => {
    const aFlightClassIndex = FLIGHT_CLASS_SORT_ORDER.indexOf(a.flightClass);
    const bFlightClassIndex = FLIGHT_CLASS_SORT_ORDER.indexOf(b.flightClass);
    if (aFlightClassIndex !== bFlightClassIndex) {
      return aFlightClassIndex - bFlightClassIndex;
    }

    const aRegionIndex = REGION_SORT_ORDER.indexOf(a.region);
    const bRegionIndex = REGION_SORT_ORDER.indexOf(b.region);
    if (aRegionIndex !== bRegionIndex) {
      return aRegionIndex - bRegionIndex;
    }

    return a.milesRequired - b.milesRequired;
  });
}
