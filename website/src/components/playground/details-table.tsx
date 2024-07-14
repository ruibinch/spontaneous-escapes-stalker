import { roundToDp } from '@/common/round-to-dp';
import { FlightClass, RouteAnalysisEntry } from '@/index';
import { useState } from 'react';
import { DetailsTableContent } from './details-table/details-table-content';
import { ShowRoutesAs } from './details-table/top-content';

type Props = {
  data: RouteAnalysisEntry[];
  startDate: Date;
  endDate: Date;
  months: string[];
};

export function DetailsTable(props: Props) {
  const { data, ...restProps } = props;
  const [showRoutesAs, setShowRoutesAs] = useState<ShowRoutesAs>('separate');

  const dataForSeparateRoutes = data.map((entry) => {
    const monthToFlightClassToRedemptionDict: Record<
      string,
      Record<FlightClass, boolean>
    > = {};
    let count = 0;
    let averageBlackoutPctSumAcrossMonths = 0;

    entry.details.forEach(({ month, redemptionDetails }) => {
      monthToFlightClassToRedemptionDict[month] = {
        Y: Boolean(redemptionDetails.Y),
        W: Boolean(redemptionDetails.W),
        J: Boolean(redemptionDetails.J),
      };

      const numRedemptionsInMonth =
        Object.values(redemptionDetails).filter(Boolean).length;
      if (numRedemptionsInMonth > 0) {
        count += 1;
      }

      const blackoutPctSumForMonth =
        (redemptionDetails.Y?.blackoutPct ?? 0) +
        (redemptionDetails.W?.blackoutPct ?? 0) +
        (redemptionDetails.J?.blackoutPct ?? 0);
      const averageBlackoutPctForMonth =
        numRedemptionsInMonth > 0
          ? blackoutPctSumForMonth / numRedemptionsInMonth
          : 0;
      averageBlackoutPctSumAcrossMonths += averageBlackoutPctForMonth;
    });

    const averageBlackoutPct =
      averageBlackoutPctSumAcrossMonths > 0 && count > 0
        ? roundToDp(averageBlackoutPctSumAcrossMonths / count, 1)
        : null;

    return {
      from: entry.from,
      fromIata: entry.fromIata,
      to: entry.to,
      toIata: entry.toIata,
      count,
      averageBlackoutPct,
      ...monthToFlightClassToRedemptionDict,
    };
  });

  const dataForCombinedRoutes = (() => {
    const cityPairToRoutes = data.reduce(
      (_cityPairToRoutes: Record<string, RouteAnalysisEntry[]>, entry) => {
        const cityPair = [entry.from, entry.to]
          .sort((a, b) => {
            // Singapore should be the first entry in the 2-tuple
            if (a === 'Singapore') return -1;
            if (b === 'Singapore') return 1;
            // if Singapore is not present, then sort alphabetically
            return a.localeCompare(b);
          })
          .join('/');
        _cityPairToRoutes[cityPair] = [
          ...(_cityPairToRoutes[cityPair] ?? []),
          entry,
        ];
        return _cityPairToRoutes;
      },
      {},
    );

    return Object.entries(cityPairToRoutes).map(([cityPair, entries]) => {
      const routesIata: string[] = [];
      const monthToFlightClassToRedemptionDict: Record<
        string,
        Record<FlightClass, boolean>
      > = {};
      const routesMetadata: {
        count: number;
        averageBlackoutPct: number | null;
      }[] = [];

      entries.forEach((entry) => {
        routesIata.push(`${entry.fromIata}-${entry.toIata}`);
        let averageBlackoutPctSumForRouteAcrossMonths = 0;
        let countForRoute = 0;

        entry.details.forEach(({ month, redemptionDetails }) => {
          monthToFlightClassToRedemptionDict[month] = {
            Y: Boolean(
              monthToFlightClassToRedemptionDict[month]?.Y ||
                redemptionDetails.Y,
            ),
            W: Boolean(
              monthToFlightClassToRedemptionDict[month]?.W ||
                redemptionDetails.W,
            ),
            J: Boolean(
              monthToFlightClassToRedemptionDict[month]?.J ||
                redemptionDetails.J,
            ),
          };

          const numRedemptionsInMonth =
            Object.values(redemptionDetails).filter(Boolean).length;
          if (numRedemptionsInMonth > 0) {
            countForRoute += 1;
          }

          const blackoutPctSumForMonth =
            (redemptionDetails.Y?.blackoutPct ?? 0) +
            (redemptionDetails.W?.blackoutPct ?? 0) +
            (redemptionDetails.J?.blackoutPct ?? 0);
          const averageBlackoutPctForMonth =
            numRedemptionsInMonth > 0
              ? blackoutPctSumForMonth / numRedemptionsInMonth
              : 0;
          averageBlackoutPctSumForRouteAcrossMonths +=
            averageBlackoutPctForMonth;
        });

        routesMetadata.push({
          count: countForRoute,
          averageBlackoutPct:
            countForRoute > 0
              ? roundToDp(
                  averageBlackoutPctSumForRouteAcrossMonths / countForRoute,
                  1,
                )
              : null,
        });
      });

      const count = routesMetadata.reduce(
        (_count, { count }) => _count + count,
        0,
      );
      const averageBlackoutPct = (() => {
        const isAllBlackoutPctNull = routesMetadata.every(
          ({ averageBlackoutPct }) => averageBlackoutPct === null,
        );
        if (isAllBlackoutPctNull) return null;

        const _averageBlackoutPct = routesMetadata.reduce(
          (
            _averageBlackoutPct: number,
            {
              count: countForRoute,
              averageBlackoutPct: averageBlackoutPctForRoute,
            },
          ) => {
            const countRatio = countForRoute / count;
            _averageBlackoutPct +=
              (averageBlackoutPctForRoute as number) * countRatio;
            return _averageBlackoutPct;
          },
          0,
        );
        return roundToDp(_averageBlackoutPct, 1);
      })();

      return {
        cities: cityPair,
        routesIata,
        count,
        averageBlackoutPct,
        ...monthToFlightClassToRedemptionDict,
      };
    });
  })();

  return (
    <DetailsTableContent
      {...restProps}
      showRoutesAs={showRoutesAs}
      setShowRoutesAs={setShowRoutesAs}
      data={
        showRoutesAs === 'separate'
          ? dataForSeparateRoutes
          : dataForCombinedRoutes
      }
    />
  );
}
