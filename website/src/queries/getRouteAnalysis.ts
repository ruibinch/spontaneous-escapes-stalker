import axios from 'axios';
import { RouteAnalysisEntry } from '@/index';

export async function getRouteAnalysis() {
  const response = await axios.get<RouteAnalysisEntry[]>('/api/route-analysis');
  return response.data;
}
