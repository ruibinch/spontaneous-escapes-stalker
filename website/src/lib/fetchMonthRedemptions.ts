import { RedemptionEntry } from '@/index';

const { CLOUDFRONT_URL } = process.env;

export async function fetchMonthRedemptions(
  month: string,
): Promise<RedemptionEntry[]> {
  const filename = `${month}-redemptions-postprocessed.json`;
  try {
    // caching is configured on CF distribution
    const response = await fetch(`${CLOUDFRONT_URL}/${filename}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to fetch ${filename}. error=${error}`);
    }

    const data = (await response.json()) as RedemptionEntry[];
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}
