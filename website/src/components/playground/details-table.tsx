import { roundToDp } from '@/common/round-to-dp';
import { FlightClass, RouteAnalysisEntry } from '@/index';
import { useState } from 'react';
import { DetailsTableContent } from './details-table/details-table-content';
import { ShowRoutesAs } from './details-table/top-content';
import { notEmpty } from '@/common/not-empty';

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
    let numRedemptions = 0;
    let numMonths = 0;
    let averageBlackoutPctSumAcrossMonths = 0;

    entry.details.forEach(({ month, redemptionDetails }) => {
      monthToFlightClassToRedemptionDict[month] = {
        Y: Boolean(redemptionDetails.Y),
        W: Boolean(redemptionDetails.W),
        J: Boolean(redemptionDetails.J),
      };

      const numRedemptionsInMonth =
        Object.values(redemptionDetails).filter(Boolean).length;
      numRedemptions += numRedemptionsInMonth;
      if (numRedemptionsInMonth > 0) {
        numMonths += 1;
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

    if (numRedemptions === 0 && numMonths === 0) {
      return null;
    }

    const averageBlackoutPct =
      averageBlackoutPctSumAcrossMonths > 0 && numMonths > 0
        ? roundToDp(averageBlackoutPctSumAcrossMonths / numMonths, 1)
        : 0;

    return {
      from: entry.from,
      fromIata: entry.fromIata,
      to: entry.to,
      toIata: entry.toIata,
      numRedemptions,
      numMonths,
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
      const monthsSet = new Set<string>();
      const routesMetadata: {
        numRedemptions: number;
        numRedemptionMonths: number; // non-unique list of months
        averageBlackoutPct: number | null;
      }[] = [];

      entries.forEach((entry) => {
        routesIata.push(`${entry.fromIata}-${entry.toIata}`);
        let averageBlackoutPctSumForRouteAcrossMonths = 0;
        let numRedemptionsForRoute = 0;
        let numRedemptionMonthsForRoute = 0;

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
          numRedemptionsForRoute += numRedemptionsInMonth;
          if (numRedemptionsInMonth > 0) {
            numRedemptionMonthsForRoute += 1;
            monthsSet.add(month);
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
          numRedemptions: numRedemptionsForRoute,
          numRedemptionMonths: numRedemptionMonthsForRoute,
          averageBlackoutPct:
            numRedemptionMonthsForRoute > 0
              ? roundToDp(
                  averageBlackoutPctSumForRouteAcrossMonths /
                    numRedemptionMonthsForRoute,
                  1,
                )
              : null,
        });
      });

      const numRedemptions = routesMetadata.reduce(
        (_numRedemptions, d) => _numRedemptions + d.numRedemptions,
        0,
      );
      const numRedemptionMonths = routesMetadata.reduce(
        (_numRedemptionMonths, d) =>
          _numRedemptionMonths + d.numRedemptionMonths,
        0,
      );
      const numUniqueMonths = Array.from(monthsSet).length;
      if (numRedemptions === 0 && numUniqueMonths === 0) {
        return null;
      }

      const averageBlackoutPct = (() => {
        const isAllBlackoutPctNull = routesMetadata.every(
          ({ averageBlackoutPct }) => averageBlackoutPct === null,
        );
        if (isAllBlackoutPctNull) return 0;

        // weighted average blackout % across the 2 routes
        const _averageBlackoutPct = routesMetadata.reduce(
          (
            _averageBlackoutPct: number,
            {
              numRedemptionMonths: numRedemptionMonthsForRoute,
              averageBlackoutPct: averageBlackoutPctForRoute,
            },
          ) => {
            const numRedemptionMonthsForRouteRatioOfTotal =
              numRedemptionMonthsForRoute / numRedemptionMonths;
            _averageBlackoutPct +=
              (averageBlackoutPctForRoute as number) *
              numRedemptionMonthsForRouteRatioOfTotal;
            return _averageBlackoutPct;
          },
          0,
        );
        return roundToDp(_averageBlackoutPct, 1);
      })();

      return {
        cities: cityPair,
        routesIata,
        numRedemptions,
        numMonths: numUniqueMonths,
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
          ? dataForSeparateRoutes.filter(notEmpty)
          : dataForCombinedRoutes.filter(notEmpty)
      }
    />
  );
}
