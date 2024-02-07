import fs from 'fs';
import { OagDataAnalysisEntry } from '../analysis/generateOagDataAnalysis';
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
}) {
  const oagDataForMonth = getOagDataForMonth(month);
  const redemptionsFiltered: RedemptionJsonPostprocessed[] = [];
  const missingRedemptions: string[] = [];

  redemptions.forEach((redemption) => {
    const { originIata, destinationIata, flightNo, flightClass } = redemption;
    const routeIata = `${originIata}-${destinationIata}`;
    const isRouteInOagDataset = oagDataForMonth.routes.find(
      ({ route }) => route === routeIata,
    );

    if (
      !isRouteInOagDataset &&
      !isRedemptionRouteExistsAsMultiLegFlight({ routeIata, flightNo })
    ) {
      missingRedemptions.push(
        `${originIata}-${destinationIata}/${flightNo}/${flightClass}`,
      );
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
    .readFileSync('data/oag-data-analysis.json')
    .toString();
  const oagDataAnalysis = JSON.parse(
    oagDataAnalysisFileContent,
  ) as OagDataAnalysisEntry[];

  const oagDataForMonth = oagDataAnalysis.find(
    (entry) => entry.month === month,
  );
  if (!oagDataForMonth) {
    throw new Error(`No OAG data for ${month}`);
  }
  return oagDataForMonth;
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
