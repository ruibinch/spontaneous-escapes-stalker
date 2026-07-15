import { roundToDp } from '@/common/round-to-dp';
import { useRoutesStats } from '@/hooks/use-routes-stats';
import { FlightClass, RouteAnalysisEntry } from '@/index';
import { FlightClassIndicator } from '../common/flight-class-indicator';
import { SummaryEntryCard } from '../common/summary-entry-card';
import { RouteDetailDatum } from './helpers/make-route-details-list';

const classNames: Record<string, string> = {
  Y: 'Economy',
  W: 'Prem Econ',
  J: 'Business',
};

export function ByRouteSummary({
  routeMetadata: { originIata, destinationIata },
  routeAnalysisList,
  detailsList,
  detailsListFiltered,
}: {
  routeMetadata: { originIata: string; destinationIata: string };
  routeAnalysisList: RouteAnalysisEntry[];
  detailsList: RouteDetailDatum[];
  detailsListFiltered: RouteDetailDatum[];
}) {
  const routesStats = useRoutesStats(routeAnalysisList);
  const routeStats = routesStats.find(
    (stat) =>
      stat.originIata === originIata &&
      stat.destinationIata === destinationIata,
  );

  // Get latest miles for each class
  const latestMiles = getLatestMiles(detailsListFiltered);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <SummaryEntryCard
        header="Redemption Months"
        content={calcRedemptionMonthsCount(detailsListFiltered)}
        subcontent={`out of ${calcRedemptionMonthsCount(detailsList)}`}
        badgeContent={
          routeStats &&
          getBadgeText({
            rank: routeStats.numMonthsRank,
            isRankShared: routeStats.isNumMonthsRankShared,
            total: routesStats.length,
          })
        }
        showSkeletonOnBadge
      />
      <SummaryEntryCard
        header="By Class"
        content={
          <div className="flex flex-col gap-0.5 text-sm">
            {(['Y', 'W', 'J'] as FlightClass[]).map((code) => {
              const count = calcRedemptionsByFlightClass(
                detailsListFiltered,
                code,
              );
              if (count === 0) return null;
              return (
                <div key={code} className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <FlightClassIndicator flightClassCode={code} />
                    <span className="text-text-secondary text-xs">
                      {classNames[code]}
                    </span>
                  </div>
                  <span className="font-semibold text-text-primary">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        }
      />
      <SummaryEntryCard
        header="Latest Miles"
        content={
          <div className="flex flex-col gap-0.5 text-sm">
            {(['Y', 'W', 'J'] as FlightClass[]).map((code) => {
              const miles = latestMiles[code];
              if (!miles) return null;
              return (
                <div key={code} className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <FlightClassIndicator flightClassCode={code} />
                    <span className="text-text-secondary text-xs">
                      {classNames[code]}
                    </span>
                  </div>
                  <span className="font-semibold text-text-primary">
                    {miles.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        }
      />
      <SummaryEntryCard
        header="Avg Blackout %"
        content={calcAvgBlackoutPct(detailsListFiltered)}
        subcontent={`total average: ${calcAvgBlackoutPct(detailsList)}`}
        badgeContent={
          routeStats &&
          getBadgeText({
            rank: routeStats.averageBlackoutPctRank,
            isRankShared: routeStats.isAverageBlackoutPctRankShared,
            total: routesStats.length,
          })
        }
        showSkeletonOnBadge
      />
    </div>
  );
}

function calcRedemptionsByFlightClass(
  list: RouteDetailDatum[],
  flightClassCode: string,
) {
  return list.filter((d) => d.flightClass === flightClassCode).length;
}

function calcRedemptionMonthsCount(list: RouteDetailDatum[]) {
  const monthsSet = list.reduce((_monthsSet: Set<string>, d) => {
    _monthsSet.add(d.month);
    return _monthsSet;
  }, new Set<string>());
  return monthsSet.size;
}

function calcAvgBlackoutPct(list: RouteDetailDatum[]) {
  const monthToCountAndBlackoutPctDict = list.reduce(
    (
      _monthToCountAndBlackoutPctDict: Record<
        string,
        { count: number; blackoutPctSum: number }
      >,
      d,
    ) => {
      _monthToCountAndBlackoutPctDict[d.month] = {
        count: (_monthToCountAndBlackoutPctDict[d.month]?.count ?? 0) + 1,
        blackoutPctSum:
          (_monthToCountAndBlackoutPctDict[d.month]?.blackoutPctSum ?? 0) +
          d.blackoutPct,
      };
      return _monthToCountAndBlackoutPctDict;
    },
    {},
  );
  const avgBlackoutPctList = Object.values(
    monthToCountAndBlackoutPctDict,
  ).reduce((avgBlackoutPctList: number[], { count, blackoutPctSum }) => {
    avgBlackoutPctList.push(blackoutPctSum / count);
    return avgBlackoutPctList;
  }, []);
  const blackoutPctSum = avgBlackoutPctList.reduce(
    (_blackoutPctSum, blackoutPct) => _blackoutPctSum + blackoutPct,
    0,
  );
  return avgBlackoutPctList.length > 0
    ? `${roundToDp(blackoutPctSum / avgBlackoutPctList.length, 1)}%`
    : '-';
}

function getLatestMiles(
  list: RouteDetailDatum[],
): Record<FlightClass, number | null> {
  const result: Record<FlightClass, number | null> = {
    Y: null,
    W: null,
    J: null,
  };

  // List is sorted by month desc, so first occurrence per class is latest
  const sorted = [...list].sort((a, b) => b.month.localeCompare(a.month));
  for (const item of sorted) {
    const cls = item.flightClass as FlightClass;
    if (result[cls] === null) {
      result[cls] = item.milesRequired;
    }
  }

  return result;
}

function getBadgeText({
  rank,
  isRankShared,
  total,
}: {
  rank: number;
  isRankShared: boolean;
  total: number;
}) {
  return `rank ${isRankShared ? 'T-' : ''}${rank} of ${total}`;
}
