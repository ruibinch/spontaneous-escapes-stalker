import axios from 'axios';
import { RouteAnalysisEntry } from '@/index';

export async function getRouteAnalysisForRoute(route: string) {
  const response = await axios.get<RouteAnalysisEntry>(
    `/api/route-analysis/${route}`,
  );
  return response.data;
}
