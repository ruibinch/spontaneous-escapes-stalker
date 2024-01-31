import { flightClassColors } from '@/components/common/colors';
import { FlightClassIndicator } from '@/components/common/flight-class-indicator';
import { ArrowDownIcon } from '@/components/icons/arrow-down';
import { ArrowUpIcon } from '@/components/icons/arrow-up';
import { MonthSummaryAnalysisEntry, RedemptionEntry } from '@/index';
import monthSummaryAnalysisFile from '@/static/month-summary-analysis.json';
import { Pie } from 'react-chartjs-2';
import { makeChartOptions } from '../../common/chart/chart-options';
import { ChartWrapper } from '../../common/chart/chart-wrapper';
import { TooltipDark } from '@/components/common/tooltip-dark';
import { Tooltip } from 'chart.js';

type FlightClassToCountDict = Record<string, number>;

export function FlightClassDistributionChart({
  redemptionsFiltered,
  isFilterActive,
}: {
  redemptionsFiltered: RedemptionEntry[];
  isFilterActive: boolean;
}) {
  const flightClassDistributionInMonth = redemptionsFiltered.reduce(
    (_flightClassDistributionInMonth: FlightClassToCountDict, redemption) => {
      switch (redemption.flightClass) {
        case 'Economy':
          _flightClassDistributionInMonth.Y += 1;
          break;
        case 'Premium Economy':
          _flightClassDistributionInMonth.PY += 1;
          break;
        case 'Business':
          _flightClassDistributionInMonth.J += 1;
          break;
        default:
          break;
      }
      return _flightClassDistributionInMonth;
    },
    { Y: 0, PY: 0, J: 0 },
  );

  const flightClassDistributionPctInMonth = Object.entries(
    flightClassDistributionInMonth,
  ).reduce(
    (
      _flightClassDistributionPctInMonth: FlightClassToCountDict,
      [flightClass, count],
    ) => {
      _flightClassDistributionPctInMonth[flightClass] =
        count / redemptionsFiltered.length;
      return _flightClassDistributionPctInMonth;
    },
    {},
  );
  const averageFlightClassDistributionPct =
    computeAverageFlightClassDistributionPct();

  const data = {
    labels: ['Economy', 'Premium Economy', 'Business'],
    datasets: [
      {
        data: Object.values(flightClassDistributionInMonth),
        backgroundColor: [
          flightClassColors.Y,
          flightClassColors.PY,
          flightClassColors.J,
        ],
      },
    ],
  };

  return (
    <ChartWrapper
      contentStyle="px-2"
      title="Breakdown by flight class"
      chart={
        <Pie
          data={data}
          options={makeChartOptions({
            axesTickLabels: { x: false, y: false },
          })}
        />
      }
      rightComponent={
        <ComparisonTable
          flightClassDistributionPctInMonth={flightClassDistributionPctInMonth}
          averageFlightClassDistributionPct={averageFlightClassDistributionPct}
          isFilterActive={isFilterActive}
        />
      }
    />
  );
}

const flightClassCodeMap: Record<string, string> = {
  Y: 'Economy',
  PY: 'Premium Economy',
  J: 'Business',
};

function ComparisonTable({
  flightClassDistributionPctInMonth,
  averageFlightClassDistributionPct,
  isFilterActive,
}: {
  flightClassDistributionPctInMonth: FlightClassToCountDict;
  averageFlightClassDistributionPct: FlightClassToCountDict;
  isFilterActive: boolean;
}) {
  const toPct = (value: number, dp = 1) => `${(value * 100).toFixed(dp)}%`;

  return (
    <div className="h-min border border-neutral-200 rounded-sm">
      <table className="table rounded-md text-xs text-center">
        <thead>
          <tr className="border-b">
            <th className="border-r"></th>
            <th className="px-3 py-2 font-semibold border-r">Month</th>
            <TooltipDark
              content="Average percentage breakdown of all redemptions"
              showArrow
            >
              <th className="px-2 py-2 font-semibold border-r">Average</th>
            </TooltipDark>
            <TooltipDark
              content="Comparison of this month's percentage breakdown against the average"
              showArrow
            >
              <th className="px-2 py-2 font-semibold">Comparison</th>
            </TooltipDark>
          </tr>
        </thead>
        <tbody>
          {['Y', 'PY', 'J'].map((flightClass, idx) => {
            const monthValue = flightClassDistributionPctInMonth[flightClass];
            const averageValue = averageFlightClassDistributionPct[flightClass];
            const diffValue = monthValue - averageValue;

            return (
              <tr
                key={flightClass}
                className={idx !== 0 ? 'border-t' : undefined}
              >
                <td className="px-2 border-r">
                  <TooltipDark content={flightClassCodeMap[flightClass]}>
                    <div className="flex flex-row items-center gap-1">
                      <FlightClassIndicator flightClassCode={flightClass} />
                      {flightClass}
                    </div>
                  </TooltipDark>
                </td>
                <td className="py-1 border-r">
                  {isFilterActive ? '-' : toPct(monthValue)}
                </td>
                <td className="py-1 border-r">
                  {isFilterActive ? '-' : toPct(averageValue)}
                </td>
                <td className="py-1 flex flex-row items-center justify-center gap-1">
                  {isFilterActive ? (
                    '-'
                  ) : (
                    <>
                      {diffValue > 0 ? (
                        <ArrowUpIcon width={14} height={14} color="#059669" /> // emerald-600
                      ) : (
                        <ArrowDownIcon width={14} height={14} color="#ef4444" /> // red-500
                      )}
                      {toPct(diffValue)}
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function computeAverageFlightClassDistributionPct() {
  const monthSummaryAnalysisList =
    monthSummaryAnalysisFile as MonthSummaryAnalysisEntry[];
  const numMonths = monthSummaryAnalysisList.length;

  let economyPctSum = 0;
  let premiumEconomyPctSum = 0;
  let businessPctSum = 0;

  monthSummaryAnalysisList.forEach((monthSummaryAnalysisEntry) => {
    const { total, byFlightClass } = monthSummaryAnalysisEntry;
    economyPctSum += byFlightClass.Y / total;
    premiumEconomyPctSum += byFlightClass.PY / total;
    businessPctSum += byFlightClass.J / total;
  });

  return {
    Y: economyPctSum / numMonths,
    PY: premiumEconomyPctSum / numMonths,
    J: businessPctSum / numMonths,
  };
}
