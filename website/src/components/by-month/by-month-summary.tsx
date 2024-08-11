import { RedemptionEntry } from '@/index';
import { SummaryEntryCard } from '../common/summary-entry-card';
import { flightClassCodeToName } from '../common/flight-class-code-to-name';
import { FlightClassIndicator } from '../common/flight-class-indicator';

export function ByMonthSummary({
  redemptions,
  redemptionsFiltered,
}: {
  redemptions: RedemptionEntry[];
  redemptionsFiltered: RedemptionEntry[];
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryEntryCard
        header="Total Redemptions"
        content={redemptionsFiltered.length}
        subcontent={`out of ${redemptions.length}`}
      />
      <SummaryEntryCardWithFlightClass
        redemptions={redemptions}
        redemptionsFiltered={redemptionsFiltered}
        header="Economy"
        flightClassCode="Y"
      />
      <SummaryEntryCardWithFlightClass
        redemptions={redemptions}
        redemptionsFiltered={redemptionsFiltered}
        header="Premium Economy"
        flightClassCode="W"
      />
      <SummaryEntryCardWithFlightClass
        redemptions={redemptions}
        redemptionsFiltered={redemptionsFiltered}
        header="Business"
        flightClassCode="J"
      />
    </div>
  );
}

function SummaryEntryCardWithFlightClass({
  redemptions,
  redemptionsFiltered,
  header,
  flightClassCode,
}: {
  redemptions: RedemptionEntry[];
  redemptionsFiltered: RedemptionEntry[];
  header: string;
  flightClassCode: string;
}) {
  return (
    <SummaryEntryCard
      header={header}
      content={
        <div className="flex flex-row items-center gap-2">
          <FlightClassIndicator flightClassCode={flightClassCode} />
          <span className="text-2xl font-semibold">
            {calcRedemptionsByFlightClass(redemptionsFiltered, flightClassCode)}
          </span>
        </div>
      }
      subcontent={`out of ${calcRedemptionsByFlightClass(redemptions, flightClassCode)}`}
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
