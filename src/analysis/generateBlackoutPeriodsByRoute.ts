import { BlackoutPeriod, RedemptionJsonPostprocessed } from '../utils/types';

type BlackoutPeriodsByRoute = Array<{
  route: string;
  blackoutPeriods: BlackoutPeriod[];
}>;

export function generateBlackoutPeriodsByRoute({
  redemptions,
}: {
  redemptions: RedemptionJsonPostprocessed[];
}) {
  const blackoutPeriodsByRouteDict: Record<string, BlackoutPeriod[]> = {};

  redemptions.forEach((redemption) => {
    const route = `${redemption.originIata}-${redemption.destinationIata}`;

    blackoutPeriodsByRouteDict[route] = [
      ...(blackoutPeriodsByRouteDict[route] ?? []),
      ...redemption.blackoutPeriod,
    ];
  });

  const blackoutPeriodsByRoute = Object.entries(
    blackoutPeriodsByRouteDict,
  ).reduce(
    (
      _blackoutPeriodsByRoute: BlackoutPeriodsByRoute,
      [route, blackoutPeriods],
    ) => {
      _blackoutPeriodsByRoute.push({ route, blackoutPeriods });
      return _blackoutPeriodsByRoute;
    },
    [],
  );

  return blackoutPeriodsByRoute;
}
