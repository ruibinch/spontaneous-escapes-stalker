import { MonthSummaryAnalysisEntry } from '@/index';
import { getErrorStatusCode } from '@/queries/common';
import axios from 'axios';
import { NextRequest } from 'next/server';

const { CLOUDFRONT_URL } = process.env;

type Params = {
  month: string;
};

export async function GET(_req: NextRequest, context: { params: Params }) {
  const { month } = context.params;
  try {
    const response = await axios.get(
      `${CLOUDFRONT_URL}/month-summary-analysis.json`,
    );
    const monthSummaryAnalysisList =
      response.data as MonthSummaryAnalysisEntry[];
    const monthSummaryAnalysisEntry = monthSummaryAnalysisList.find(
      (entry) => entry.month === month,
    )!;

    return Response.json(monthSummaryAnalysisEntry);
  } catch (err) {
    return Response.json({
      statusCode: getErrorStatusCode(err),
    });
  }
}
