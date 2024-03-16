import { execPromise } from '../lib/git';

export async function updateWebsiteDataFiles() {
  try {
    const output = await execPromise(
      'cd website && yarn update-data-files && cd ..',
    );
    return output.trim();
  } catch (e) {
    throw new Error('Failed to update website data files');
  }
}
