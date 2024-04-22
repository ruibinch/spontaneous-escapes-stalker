import { RouteAnalysisEntry } from '@/index';
import { getErrorStatusCode } from '@/queries/common';
import axios from 'axios';
import { NextRequest } from 'next/server';

const { CLOUDFRONT_URL } = process.env;

type Params = {
  route: string;
};

export async function GET(_req: NextRequest, context: { params: Params }) {
  const { route } = context.params;
  try {
    const response = await axios.get(`${CLOUDFRONT_URL}/route-analysis.json`);
    const routeAnalysisList = response.data as RouteAnalysisEntry[];
    const routeAnalysisEntry = routeAnalysisList.find(
      (d) => d.fromIata === route.slice(0, 3) && d.toIata === route.slice(3, 6),
    )!;

    return Response.json(routeAnalysisEntry);
  } catch (err) {
    return Response.json({
      statusCode: getErrorStatusCode(err),
    });
  }
}
