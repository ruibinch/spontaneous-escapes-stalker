import { SectionHeader } from '../section-header';
import { AverageBlackoutPctByMonth } from './average-blackout-pct-by-month';
import { AverageBlackoutPctOverTime } from './average-blackout-pct-over-time';
import { BlackoutPctTables } from './blackout-pct-tables';

export function BlackoutPct() {
  return (
    <div className="flex flex-col gap-4">
      <SectionHeader header="Blackout %" />

      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2 xl:col-span-1">
          <AverageBlackoutPctOverTime />
        </div>
        <div className="col-span-2 xl:col-span-1">
          <AverageBlackoutPctByMonth />
        </div>
      </div>

      <BlackoutPctTables />
    </div>
  );
}
