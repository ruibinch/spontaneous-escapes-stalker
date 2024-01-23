'use client';
import { monthNumToNameMap } from '@/common/months-map';
import { FlightClassSelectOption, RedemptionEntry } from '@/index';
import { useState } from 'react';
import { RedemptionsTable } from './redemptions-table';
import { MonthDisplayFilters } from './month-display-filters';
import { filterRedemptionEntryList } from './helpers/filter-redemption-entry-list';

export function MonthDisplayContent({
  redemptions,
  month,
}: {
  redemptions: RedemptionEntry[];
  month: string;
}) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [flightClassOption, setFlightClassOption] =
    useState<FlightClassSelectOption>('ALL');
  const [regions, setRegions] = useState<string>('All'); // comma-separated list of regions

  const redemptionsFiltered = filterRedemptionEntryList({
    data: redemptions,
    filters: {
      searchTerm,
      regions: regions.split(','),
      flightClassOption,
    },
  });

  return (
    <div className="flex flex-col w-full gap-8">
      <h1 className="text-2xl font-bold">{`${month.slice(0, 4)} ${
        monthNumToNameMap[month.slice(4, 6)]
      }`}</h1>

      <div className="flex flex-col gap-4">
        <MonthDisplayFilters
          flightClassOption={flightClassOption}
          setFlightClassOption={setFlightClassOption}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          regions={regions}
          setRegions={setRegions}
        />

        <RedemptionsTable
          data={redemptionsFiltered}
          tableSummaryComponent={
            <TableSummary
              redemptions={redemptions}
              redemptionsFiltered={redemptionsFiltered}
            />
          }
        />
      </div>
    </div>
  );
}

function TableSummary({
  redemptions,
  redemptionsFiltered,
}: {
  redemptions: RedemptionEntry[];
  redemptionsFiltered: RedemptionEntry[];
}) {
  return redemptions.length === redemptionsFiltered.length ? (
    <div>
      <span>Total </span>
      <span className="font-bold">{`${redemptionsFiltered.length} entries`}</span>
    </div>
  ) : (
    <div>
      <span>Showing </span>
      <span className="font-bold">{`${redemptionsFiltered.length} of ${redemptions.length} entries`}</span>
    </div>
  );
}
