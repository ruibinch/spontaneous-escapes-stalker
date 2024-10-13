import { RedemptionEntry } from '@/index';
import { SummaryEntryCard } from '../common/summary-entry-card';
import { flightClassCodeToName } from '../common/flight-class-code-to-name';
import { FlightClassIndicator } from '../common/flight-class-indicator';
import { useMonthsStats } from '@/hooks/use-months-stats';

export function ByMonthSummary({
  month,
  redemptions,
  redemptionsFiltered,
  disableSkeleton,
}: {
  month: string;
  redemptions: RedemptionEntry[];
  redemptionsFiltered: RedemptionEntry[];
  disableSkeleton: boolean;
}) {
  const monthsStats = useMonthsStats();
  const monthStats = monthsStats.find((stat) => stat.month === month);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      <SummaryEntryCard
        header="Total Redemptions"
        content={redemptionsFiltered.length}
        subcontent={`out of ${redemptions.length}`}
        badgeContent={
          monthStats &&
          `rank ${monthStats.isCountRankShared ? 'T-' : ''}${
            monthStats.countRank
          } of ${monthsStats.length}`
        }
        disableSkeleton={disableSkeleton}
      />
      <SummaryEntryCardWithFlightClass
        redemptions={redemptions}
        redemptionsFiltered={redemptionsFiltered}
        header="Economy"
        flightClassCode="Y"
        disableSkeleton={disableSkeleton}
      />
      <SummaryEntryCardWithFlightClass
        redemptions={redemptions}
        redemptionsFiltered={redemptionsFiltered}
        header="Premium Economy"
        flightClassCode="W"
        disableSkeleton={disableSkeleton}
      />
      <SummaryEntryCardWithFlightClass
        redemptions={redemptions}
        redemptionsFiltered={redemptionsFiltered}
        header="Business"
        flightClassCode="J"
        disableSkeleton={disableSkeleton}
      />
    </div>
  );
}

function SummaryEntryCardWithFlightClass({
  redemptions,
  redemptionsFiltered,
  header,
  flightClassCode,
  disableSkeleton,
}: {
  redemptions: RedemptionEntry[];
  redemptionsFiltered: RedemptionEntry[];
  header: string;
  flightClassCode: string;
  disableSkeleton: boolean;
}) {
  return (
    <SummaryEntryCard
      disableSkeleton={disableSkeleton}
      header={header}
      content={
        <div className="flex flex-row items-center gap-2">
          <FlightClassIndicator flightClassCode={flightClassCode} />
          <span className="text-2xl font-semibold">
            {calcRedemptionsByFlightClass(redemptionsFiltered, flightClassCode)}
          </span>
        </div>
      }
      subcontent={`out of ${calcRedemptionsByFlightClass(
        redemptions,
        flightClassCode,
      )}`}
    />
  );
}

function calcRedemptionsByFlightClass(
  list: RedemptionEntry[],
  flightClassCode: string,
) {
  return list.filter(
    (d) => d.flightClass === flightClassCodeToName[flightClassCode],
  ).length;
}
