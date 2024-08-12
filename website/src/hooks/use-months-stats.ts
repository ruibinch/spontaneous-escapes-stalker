import { MonthSummaryAnalysisEntry } from '@/index';
import monthSummaryAnalysisFile from '@/static/month-summary-analysis.json';

const monthSummaryAnalysisList =
  monthSummaryAnalysisFile as MonthSummaryAnalysisEntry[];

export interface MonthsStats {
  month: string;
  count: number;
  countRank: number;
  isCountRankShared: boolean;
}

export const useMonthsStats = (): MonthsStats[] => {
  const monthsStats = monthSummaryAnalysisList.map((entry) => ({
    month: entry.month,
    count: entry.count,
  }));

  const countList = monthsStats
    .map((entry) => entry.count)
    .sort((a, b) => b - a);

  return monthsStats.map((stats) => ({
    ...stats,
    countRank: countList.indexOf(stats.count) + 1,
    isCountRankShared: countList.filter((v) => v === stats.count).length > 1,
  }));
};
