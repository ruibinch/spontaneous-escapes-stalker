import { getMonthsWithRouteNetworkData } from '@/common/get-months-with-route-network-data';
import { makeChartOptions } from '@/components/common/chart/chart-options';
import { ChartWrapper } from '@/components/common/chart/chart-wrapper';
import { covidLinePlugin } from '@/components/common/chart/covid-line-plugin';
import { flightClassColors } from '@/components/common/colors';
import { YEAR_ALL } from '@/components/common/filters/year-filter';
import { flightClassCodeOrder } from '@/components/common/flight-class-code-to-name';
import { useTheme } from '@/components/common/use-theme';
import { useSearchParams } from 'next/navigation';
import { Line } from 'react-chartjs-2';
import { RouteDetailDatum } from '../helpers/make-route-details-list';

export function BlackoutPctOverTimeChart({
  detailsListFiltered,
}: {
  detailsListFiltered: RouteDetailDatum[];
}) {
  const searchParams = useSearchParams();
  const year = searchParams.get('year') ?? YEAR_ALL;

  const { isDarkTheme } = useTheme();
  const monthsWithRouteNetworkData = getMonthsWithRouteNetworkData(
    year.split(','),
  );
  const flightClassToMonthToBlackoutPctDict: Record<
    string,
    Record<string, string | number>
  > = {};

  flightClassCodeOrder.forEach((flightClass) => {
    const detailsListForFlightClass = detailsListFiltered.filter(
      (d) => d.flightClass === flightClass,
    );

    const monthToBlackoutPctDict = Array.from(
      monthsWithRouteNetworkData,
    ).reduce(
      (_monthToBlackoutPctDict: Record<string, string | number>, month) => {
        const detailsForFlightClassAndMonth = detailsListForFlightClass.find(
          (d) => d.month === month,
        );
        _monthToBlackoutPctDict[month] =
          detailsForFlightClassAndMonth?.blackoutPct ?? 'N/A';
        return _monthToBlackoutPctDict;
      },
      {},
    );

    flightClassToMonthToBlackoutPctDict[flightClass] = monthToBlackoutPctDict;
  });

  const data = {
    labels: Array.from(monthsWithRouteNetworkData).map(
      (month) => `${month.slice(0, 4)}-${month.slice(4, 6)}`,
    ),
    datasets: [
      {
        label: 'Economy',
        data: Object.values(flightClassToMonthToBlackoutPctDict.Y),
        borderColor: flightClassColors.Y,
        borderWidth: 1,
        backgroundColor: flightClassColors.Y,
        pointRadius: 2,
      },
      {
        label: 'Premium Economy',
        data: Object.values(flightClassToMonthToBlackoutPctDict.W),
        borderColor: flightClassColors.W,
        borderWidth: 1,
        backgroundColor: flightClassColors.W,
        pointRadius: 2,
      },
      {
        label: 'Business',
        data: Object.values(flightClassToMonthToBlackoutPctDict.J),
        borderColor: flightClassColors.J,
        borderWidth: 1,
        backgroundColor: flightClassColors.J,
        pointRadius: 2,
      },
    ],
  };

  return (
    <ChartWrapper
      title="Blackout % over time"
      chart={
        <Line
          options={makeChartOptions({
            isDarkTheme,
            axesTicks: { x: true, y: false },
            axesBorder: { x: true },
            axesMinValue: { y: 0 },
            axesMaxValue: { y: 100 },
            axesTicksOnChartArea: { x: false, y: true },
            axesTickMaxLimit: { x: 10, y: 6 },
            axesTickLabelRenderFn: {
              y: (value) => `${value}%`,
            },
            tooltipLabelSuffix: '%',
          })}
          plugins={[covidLinePlugin]}
          data={data}
        />
      }
      tooltip="Equivalent to the total number of blackout days for all flights, divided by total number of days in the month"
      // The limitation is all flights are considered equally in terms of number of seats.
    />
  );
}
