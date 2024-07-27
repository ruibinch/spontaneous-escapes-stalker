import { isAfter } from 'date-fns';
import fs from 'fs';
import { OagDataAnalysisEntry } from '../scripts/generateOagData';
import { log } from '../utils/log';
import { RedemptionJsonPostprocessed } from '../utils/types';

/**
 * Some SE redemptions are missing from the OAG routes dataset. This is impossible if the OAG dataset is 100% accurate.
 *
 * We assume the accuracy of the OAG dataset, and remove redemptions that are not part of the route network.
 */
export function removeRedemptionsMissingFromOagRoutesDataset({
  redemptions,
  month,
}: {
  redemptions: RedemptionJsonPostprocessed[];
  month: string;
}): RedemptionJsonPostprocessed[] {
  const oagDataForMonth = getOagDataForMonth(month);
  if (!oagDataForMonth) {
    return redemptions;
  }

  const redemptionsFiltered: RedemptionJsonPostprocessed[] = [];
  const missingRedemptions: string[] = [];

  redemptions.forEach((redemption) => {
    const { originIata, destinationIata, flightNos, flightClass } = redemption;
    const routeIata = `${originIata}-${destinationIata}`;
    const isRouteInOagDataset = oagDataForMonth.routes.find(
      ({ route }) => route === routeIata,
    );

    const flightNosWithMissingRedemption = flightNos.filter(
      (flightNo) =>
        !isRedemptionRouteExistsAsMultiLegFlight({ routeIata, flightNo }),
    );
    if (!isRouteInOagDataset && flightNosWithMissingRedemption.length > 0) {
      flightNosWithMissingRedemption.forEach((flightNo) => {
        missingRedemptions.push(
          `${originIata}-${destinationIata}/${flightNo}/${flightClass}`,
        );
      });
    } else {
      redemptionsFiltered.push(redemption);
    }
  });

  if (missingRedemptions.length > 0) {
    console.log(
      `\n🧹 Postprocessing for ${month} - reduced from ${redemptions.length} to ${redemptionsFiltered.length} redemptions\n`,
      `\t${missingRedemptions.join(', ')}`,
    );
  }

  return redemptionsFiltered;
}

function getOagDataForMonth(month: string) {
  const oagDataAnalysisFileContent = fs
    .readFileSync('data/oag-data.json')
    .toString();
  const oagDataAnalysis = JSON.parse(
    oagDataAnalysisFileContent,
  ) as OagDataAnalysisEntry[];

  const { month: lastMonthWithOagData } =
    oagDataAnalysis[oagDataAnalysis.length - 1];
  const isAfterLastMonthWithOagData = isAfter(
    yyyymmToDate(month),
    yyyymmToDate(lastMonthWithOagData),
  );

  const oagDataForMonth = oagDataAnalysis.find(
    (entry) => entry.month === month,
  );
  if (!oagDataForMonth && !isAfterLastMonthWithOagData) {
    const errorMessage = `No OAG data for ${month}`;
    log(errorMessage, true);
    throw new Error(errorMessage);
  }
  return oagDataForMonth;
}

function yyyymmToDate(s: string) {
  return new Date(`${s.slice(0, 4)}-${s.slice(4, 6)}-01`);
}

/**
 * These redemptions are part of multi-leg flights, but the OAG dataset splits them up into 2.
 * e.g. Redemption exists as SIN-IAH, but it's broken up into SIN-MAN-IAH in the OAG dataset.
 *
 * In such cases, we do not want to erroneously remove this redemption.
 * TODO: To consider if there's a better way to handle this
 */
function isRedemptionRouteExistsAsMultiLegFlight({
  routeIata,
  flightNo,
}: {
  routeIata: string;
  flightNo: string;
}) {
  const MULTI_LEG_FLIGHT_ROUTES = [
    'SIN-JFK/SQ26', // SIN-FRA-JFK
    'JFK-SIN/SQ25', // JFK-FRA-SIN
    'SIN-IAH/SQ52', // SIN-MAN-IAH
  ];
  return MULTI_LEG_FLIGHT_ROUTES.includes(`${routeIata}/${flightNo}`);
}
