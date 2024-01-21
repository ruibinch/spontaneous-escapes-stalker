import { getMonthsList } from '@/common/get-months-list';
import { FlightClassSelectOption, RouteAnalysisEntry } from '@/index';
import { filterApplicableMonthsList } from './filter-applicable-months-list';

type RouteFrequencyByFlightClass = Record<
  FlightClassSelectOption,
  Array<{
    from: string;
    to: string;
    fromIata: string;
    toIata: string;
    count: number;
  }>
>;

export function computeRouteFrequencyByFlightClass({
  routeAnalysisList,
  startDate,
  endDate,
}: {
  routeAnalysisList: RouteAnalysisEntry[];
  startDate?: Date;
  endDate?: Date;
}): RouteFrequencyByFlightClass {
  const applicableMonths = filterApplicableMonthsList({
    months: getMonthsList(),
    startDate,
    endDate,
  });

  const routeFrequencyByFlightClass: RouteFrequencyByFlightClass = {
    Y: [],
    PY: [],
    J: [],
    ALL: [],
  };

  routeAnalysisList.forEach((routeAnalysis) => {
    const { details, ...routeInfoProps } = routeAnalysis;
    let economyRedemptionsCount = 0;
    let premiumEconomyRedemptionsCount = 0;
    let businessRedemptionsCount = 0;

    applicableMonths.forEach((month) => {
      const detailsForMonth = details[month];

      if (detailsForMonth.Y) {
        economyRedemptionsCount += 1;
      }
      if (detailsForMonth.PY) {
        premiumEconomyRedemptionsCount += 1;
      }
      if (detailsForMonth.J) {
        businessRedemptionsCount += 1;
      }
    });

    const totalRedemptionsCount =
      economyRedemptionsCount +
      premiumEconomyRedemptionsCount +
      businessRedemptionsCount;

    routeFrequencyByFlightClass.Y.push({
      ...routeInfoProps,
      count: economyRedemptionsCount,
    });
    routeFrequencyByFlightClass.PY.push({
      ...routeInfoProps,
      count: premiumEconomyRedemptionsCount,
    });
    routeFrequencyByFlightClass.J.push({
      ...routeInfoProps,
      count: businessRedemptionsCount,
    });
    routeFrequencyByFlightClass.ALL.push({
      ...routeInfoProps,
      count: totalRedemptionsCount,
    });
  });

  return sortRouteFrequencyByFlightClass(routeFrequencyByFlightClass);
}

function sortRouteFrequencyByFlightClass(
  routeFrequencyByFlightClass: RouteFrequencyByFlightClass,
) {
  return Object.entries(routeFrequencyByFlightClass).reduce(
    (
      routeFrequencyByFlightClassSorted,
      [flightClass, routeInfoWithFrequencyList],
    ) => {
      // @ts-expect-error flightClass is of correct type here
      routeFrequencyByFlightClassSorted[flightClass] = [
        ...routeInfoWithFrequencyList,
      ].sort((a, b) => b.count - a.count);
      return routeFrequencyByFlightClassSorted;
    },
    {} as RouteFrequencyByFlightClass,
  );
}
