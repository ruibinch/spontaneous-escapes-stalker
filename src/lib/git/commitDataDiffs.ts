import {
  checkHasDiffs,
  getDiffFilenames,
  gitAdd,
  gitCommit,
  gitPullWithRebase,
  gitPush,
} from '.';

const DATA_FOLDER_PATHSPEC = 'data';
const WEBSITE_STATIC_FOLDER_PATHSPEC = 'website/src/static';
const GIT_REPOSITORY_URL =
  'git@github.com-spontaneous-escapes-stalker:ruibinch/spontaneous-escapes-stalker.git';
const GIT_COMMITTER_NAME = 'spontaneous-escapes-stalker-deploy-token';

/**
 * Checks for any diffs in the `data` and `website/src/static` folders.
 * If so, commit and push them using the deploy token.
 */
export async function commitDataDiffs({
  isNewRelease,
}: {
  isNewRelease: boolean;
}) {
  const hasDataDiffs = await checkHasDiffs(DATA_FOLDER_PATHSPEC);
  const hasWebsiteStaticDiffs = await checkHasDiffs(
    WEBSITE_STATIC_FOLDER_PATHSPEC,
  );
  if (!hasDataDiffs && !hasWebsiteStaticDiffs) {
    console.log('No diffs in data or website/src/static folders to commit');
    return;
  }

  await gitAdd(DATA_FOLDER_PATHSPEC);
  await gitAdd(WEBSITE_STATIC_FOLDER_PATHSPEC);

  const stagedFilenames = await getDiffFilenames({ staged: true });
  const yearMonth = stagedFilenames.match(/\d{6}/);
  if (!yearMonth) {
    throw new Error(
      `Unable to extract year/month value from staged filenames: ${stagedFilenames}`,
    );
  }

  await gitCommit({
    message: `${isNewRelease ? 'add' : 'update'} ${yearMonth[0]} content`,
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
  const args = process.argv.slice(2);
  const isNewRelease = args[0] ? args[0] === 'true' : true;
  commitDataDiffs({ isNewRelease })
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
