import axios from 'axios';
import { NextRequest } from 'next/server';

const FEEDBACK_URL =
  'https://htfvnmlw0h.execute-api.ap-southeast-1.amazonaws.com/feedback';

export async function POST(req: NextRequest) {
  const feedback = (await req.json()) as { email: string; message: string };
  const response = await axios.post(FEEDBACK_URL, feedback);
  return Response.json({
    statusCode: response.status,
  });
}
