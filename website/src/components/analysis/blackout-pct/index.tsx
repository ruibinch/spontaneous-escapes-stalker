import { MonthSummaryAnalysisEntry, RouteAnalysisEntry } from '@/index';
import { CommonStyles } from '../../common/styles';
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
    <section className="flex flex-col gap-5">
      <div>
        <h2 className={CommonStyles.SectionTitle}>Blackout % Deep Dive</h2>
        <p className="text-sm text-text-secondary mt-0.5">
          How blackout restrictions have changed over time and which routes are
          most affected
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
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
    </section>
  );
}
