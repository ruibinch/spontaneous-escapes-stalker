import { FlightClass, RouteAnalysisEntry, RedemptionInfoSingle } from '@/index';
import {
  DetailsTableContent,
  DetailsTableContentProps,
} from './details-table/details-table-content';
import { useState } from 'react';
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

    entry.details.forEach((detail) => {
      monthToFlightClassToRedemptionDict[detail.month] = {
        Y: Boolean(detail.redemptionDetails.Y),
        W: Boolean(detail.redemptionDetails.W),
        J: Boolean(detail.redemptionDetails.J),
      };
      const hasRedemptionInMonth = Object.values(detail.redemptionDetails).some(
        Boolean,
      );
      if (hasRedemptionInMonth) {
        count += 1;
      }
    });

    return {
      from: entry.from,
      fromIata: entry.fromIata,
      to: entry.to,
      toIata: entry.toIata,
      count,
      ...monthToFlightClassToRedemptionDict,
    };
  });

  const citiesToRoutes: Record<string, RouteAnalysisEntry[]> = {};
  data.forEach((entry) => {
    const cities = [entry.from, entry.to]
      .sort((a, b) => {
        // Singapore should be the first entry in the 2-tuple
        if (a === 'Singapore') return -1;
        if (b === 'Singapore') return 1;
        // if Singapore is not present, then sort alphabetically
        return a.localeCompare(b);
      })
      .join('/');
    citiesToRoutes[cities] = [...(citiesToRoutes[cities] ?? []), entry];
  });

  const dataForCombinedRoutes = Object.entries(citiesToRoutes).map(
    ([cities, entries]) => {
      const routesIata: string[] = [];
      const monthToFlightClassToRedemptionDict: Record<
        string,
        Record<FlightClass, boolean>
      > = {};

      entries.forEach((entry) => {
        routesIata.push(`${entry.fromIata}-${entry.toIata}`);

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
        });
      });

      const count = Object.values(monthToFlightClassToRedemptionDict).reduce(
        (_count: number, flightClassToRedemptionDict) => {
          if (Object.values(flightClassToRedemptionDict).some(Boolean)) {
            _count += 1;
          }
          return _count;
        },
        0,
      );

      return {
        cities,
        routesIata,
        count,
        ...monthToFlightClassToRedemptionDict,
      };
    },
  );

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
