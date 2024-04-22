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
      `${CLOUDFRONT_URL}/${month}-redemptions-postprocessed.json`,
    );
    return Response.json(response.data);
  } catch (err) {
    return Response.json({
      statusCode: getErrorStatusCode(err),
    });
  }
}
