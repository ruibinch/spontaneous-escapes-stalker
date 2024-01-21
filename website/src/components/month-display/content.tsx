'use client';
import { monthNumToNameMap } from '@/common/months-map';
import { FlightClassSelectOption, RedemptionEntry } from '@/index';
import { useState } from 'react';
import { RedemptionsTable } from './redemptions-table';
import { RedemptionsTableFilters } from './redemptions-table-filters';
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

  const header = `${month.slice(0, 4)} ${monthNumToNameMap[month.slice(4, 6)]}`;

  const redemptionsFiltered = filterRedemptionEntryList({
    data: redemptions,
    filters: {
      searchTerm,
      regions: regions.split(','),
      flightClassOption,
    },
  });

  return (
    <div className="h-full lg:px-6">
      <div className="flex justify-center pt-12 pb-12 px-4 lg:px-0 flex-wrap xl:flex-nowrap max-w-[90rem] mx-auto w-full">
        <div className="gap-12 flex flex-col w-full">
          <h1 className="text-2xl font-bold">{header}</h1>

          <div className="flex flex-col gap-4">
            <RedemptionsTableFilters
              flightClassOption={flightClassOption}
              setFlightClassOption={setFlightClassOption}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              regions={regions}
              setRegions={setRegions}
            />

            <RedemptionsTable data={redemptionsFiltered} />
          </div>
        </div>
      </div>
    </div>
  );
}
