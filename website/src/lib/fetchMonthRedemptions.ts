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
      throw new Error(`Failed to fetch ${filename}`);
    }

    const data = (await response.json()) as RedemptionEntry[];
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}
