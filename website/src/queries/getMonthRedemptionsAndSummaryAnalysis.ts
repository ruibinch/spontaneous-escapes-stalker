import axios from 'axios';
import { MonthSummaryAnalysisEntry, RedemptionEntry } from '@/index';

export async function getMonthRedemptionsAndSummaryAnalysis(month: string) {
  const byMonthResponse = await axios.get<RedemptionEntry[]>(
    `/api/by-month/${month}`,
  );
  const monthSummaryAnalysisResponse =
    await axios.get<MonthSummaryAnalysisEntry>(
      `/api/month-summary-analysis/${month}`,
    );

  return {
    redemptions: byMonthResponse.data,
    monthSummaryAnalysisEntry: monthSummaryAnalysisResponse.data,
  };
}
