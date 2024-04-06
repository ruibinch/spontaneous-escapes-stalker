import { execPromise } from '../lib/git';

export async function deployWebsiteProd() {
  try {
    const output = await execPromise('cd website && vercel deploy --prod && cd ..');
    return output.trim();
  } catch (e) {
    throw new Error('Failed to deploy website');
  }
}
