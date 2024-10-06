import { MonthSummaryAnalysisEntry, RouteAnalysisEntry } from '@/index';
import { SectionHeader } from '../section-header';
import { AverageBlackoutPctByMonth } from './average-blackout-pct-by-month';
import { AverageBlackoutPctOverTime } from './average-blackout-pct-over-time';
import { BlackoutPctTables } from './blackout-pct-tables';

export function BlackoutPct({
  monthSummaryAnalysisList,
  routeAnalysisList,
}: {
  monthSummaryAnalysisList: MonthSummaryAnalysisEntry[];
  routeAnalysisList: RouteAnalysisEntry[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <SectionHeader header="Blackout %" />

      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2 xl:col-span-1">
          <AverageBlackoutPctOverTime
            monthSummaryAnalysisList={monthSummaryAnalysisList}
          />
        </div>
        <div className="col-span-2 xl:col-span-1">
          <AverageBlackoutPctByMonth
            monthSummaryAnalysisList={monthSummaryAnalysisList}
          />
        </div>
      </div>

      <BlackoutPctTables routeAnalysisList={routeAnalysisList} />
    </div>
  );
}
