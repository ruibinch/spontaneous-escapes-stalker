import { roundToDp } from '@/common/round-to-dp';
import { useRoutesStats } from '@/hooks/use-routes-stats';
import { flightClassCodeOrder } from '../common/flight-class-code-to-name';
import { FlightClassIndicator } from '../common/flight-class-indicator';
import { SummaryEntryCard } from '../common/summary-entry-card';
import { RouteDetailDatum } from './helpers/make-route-details-list';

export function ByRouteSummary({
  detailsList,
  detailsListFiltered,
}: {
  detailsList: RouteDetailDatum[];
  detailsListFiltered: RouteDetailDatum[];
}) {
  const routesStats = useRoutesStats();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryEntryCard
        header="Redemptions"
        content={detailsListFiltered.length}
        subcontent={`out of ${detailsList.length}`}
      />
      <SummaryEntryCard
        cardBodyClassName="px-3 md:px-6"
        header="Redemptions, by class"
        content={
          <div className="flex flex-col text-sm">
            {flightClassCodeOrder.map((code) => (
              <div key={code} className="flex justify-between">
                <div className="flex flex-row items-center gap-1.5">
                  <FlightClassIndicator flightClassCode={code} />
                  <span>{code}</span>
                </div>
                <div className="font-semibold">
                  {calcRedemptionsByFlightClass(detailsListFiltered, code)}
                </div>
              </div>
            ))}
          </div>
        }
      />
      <SummaryEntryCard
        header="Redemption months"
        content={calcRedemptionMonthsCount(detailsListFiltered)}
        subcontent={`out of ${calcRedemptionMonthsCount(detailsList)}`}
      />
      <SummaryEntryCard
        header="Average blackout %"
        content={calcAvgBlackoutPct(detailsListFiltered)}
        subcontent={`total average of ${calcAvgBlackoutPct(detailsList)}`}
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
        {
          count: number;
          blackoutPctSum: number;
        }
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
  return `${roundToDp(blackoutPctSum / avgBlackoutPctList.length, 1)}%`;
}
