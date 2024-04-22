import axios from 'axios';
import { MonthSummaryAnalysisEntry } from '@/index';

export async function getMonthSummaryAnalysis() {
  const response = await axios.get<MonthSummaryAnalysisEntry[]>(
    '/api/month-summary-analysis',
  );
  return response.data;
}
