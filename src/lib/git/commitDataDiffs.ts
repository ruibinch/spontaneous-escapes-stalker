import {
  checkHasDiffs,
  getDiffFilenames,
  gitAdd,
  gitCommit,
  gitPullWithRebase,
  gitPush,
} from '.';

const DATA_FOLDER_PATHSPEC = 'data';
const GIT_REPOSITORY_URL =
  'git@github.com-spontaneous-escapes-stalker:ruibinch/spontaneous-escapes-stalker.git';
const GIT_COMMITTER_NAME = 'spontaneous-escapes-stalker-deploy-token';

/**
 * Checks for any diffs in the /data folder.
 * If so, commit and push them using the deploy token.
 */
export async function commitDataDiffs() {
  const hasDiffs = await checkHasDiffs(DATA_FOLDER_PATHSPEC);
  if (!hasDiffs) {
    console.log('No diffs in data folder to commit');
    return;
  }

  await gitAdd(DATA_FOLDER_PATHSPEC);

  const stagedFilenames = await getDiffFilenames({ staged: true });
  const yearMonth = stagedFilenames.match(/\d{6}/);
  if (!yearMonth) {
    throw new Error(
      `Unable to extract year/month value from staged filenames: ${stagedFilenames}`,
    );
  }

  await gitCommit({
    message: `add ${yearMonth[0]} content`,
    overrideCreds: {
      name: GIT_COMMITTER_NAME,
      email: GIT_COMMITTER_NAME,
    },
  });

  // pull changes from remote before pushing
  await gitPullWithRebase();

  await gitPush({ repository: GIT_REPOSITORY_URL });
}

if (require.main === module) {
  commitDataDiffs()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
