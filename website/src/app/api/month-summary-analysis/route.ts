import { getErrorStatusCode } from '@/queries/common';
import axios from 'axios';

const { CLOUDFRONT_URL } = process.env;

export async function GET() {
  try {
    const response = await axios.get(
      `${CLOUDFRONT_URL}/month-summary-analysis.json`,
    );
    return Response.json(response.data);
  } catch (err) {
    return Response.json({
      statusCode: getErrorStatusCode(err),
    });
  }
}
