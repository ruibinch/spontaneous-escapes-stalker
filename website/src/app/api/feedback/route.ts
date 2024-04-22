import { getErrorStatusCode } from '@/queries/common';
import axios from 'axios';
import { NextRequest } from 'next/server';

const { APIGW_ID, APIGW_KEY } = process.env;

const FEEDBACK_URL = `https://${APIGW_ID}.execute-api.ap-southeast-1.amazonaws.com/dev/feedback`;

export async function POST(req: NextRequest) {
  const feedback = (await req.json()) as { email: string; message: string };

  try {
    const response = await axios.post(FEEDBACK_URL, feedback, {
      headers: {
        'X-API-KEY': APIGW_KEY,
      },
    });
    return Response.json({
      statusCode: response.status,
    });
  } catch (err) {
    return Response.json({
      statusCode: getErrorStatusCode(err),
    });
  }
}
