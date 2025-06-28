import { RouteAnalysisEntry } from '@/index';

export async function fetchRouteAnalysis(): Promise<RouteAnalysisEntry[]> {
  try {
    // caching is configured on CF distribution
    const response = await fetch(
      'https://dyojygdh7fkqs.cloudfront.net/route-analysis.json',
      { cache: 'no-cache' },
    );
    if (!response.ok) {
      throw new Error('Failed to fetch route-analysis.json');
    }

    const data = (await response.json()) as RouteAnalysisEntry[];
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}
