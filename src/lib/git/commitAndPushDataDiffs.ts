import {
  checkHasDiffs,
  gitAdd,
  gitCommit,
  gitPullWithRebase,
  gitPush
} from '.';

const DATA_FOLDER_PATHSPEC = 'data';
const WEBSITE_STATIC_FOLDER_PATHSPEC = 'website/src/static';
const GIT_REPOSITORY_URL =
  'git@github.com-spontaneous-escapes-stalker:ruibinch/spontaneous-escapes-stalker.git';
const GIT_COMMITTER_NAME = 'spontaneous-escapes-stalker-deploy-token';

/**
 * Checks for any diffs in the `data` and `website/src/static` folders.
 * If so, commit and push them using the deploy token.
 *
 * @param redemptionMonth - YYYYMM of the redemption period
 * @param isNewRelease - If the redemption is a new release
 */
export async function commitAndPushDataDiffs({
  redemptionMonth,
  isNewRelease,
}: {
  redemptionMonth: string;
  isNewRelease: boolean;
}): Promise<{ hasDiffs: boolean }> {
  const hasDataDiffs = await checkHasDiffs(DATA_FOLDER_PATHSPEC);
  const hasWebsiteStaticDiffs = await checkHasDiffs(
    WEBSITE_STATIC_FOLDER_PATHSPEC,
  );
  if (!hasDataDiffs && !hasWebsiteStaticDiffs) {
    console.log('No diffs in data or website/src/static folders to commit');
    return { hasDiffs: false };
  }

  await gitAdd(DATA_FOLDER_PATHSPEC);
  await gitAdd(WEBSITE_STATIC_FOLDER_PATHSPEC);

  await gitCommit({
    message: `${isNewRelease ? 'add' : 'update'} ${redemptionMonth} content`,
    overrideCreds: {
      name: GIT_COMMITTER_NAME,
      email: GIT_COMMITTER_NAME,
    },
  });

  // pull changes from remote before pushing
  await gitPullWithRebase();

  await gitPush({ repository: GIT_REPOSITORY_URL });

  return { hasDiffs: true };
}
