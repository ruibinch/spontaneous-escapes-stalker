import { exec } from 'child_process';

const execPromise = (command: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout) => {
      if (error) return reject(error);
      return resolve(stdout);
    });
  });
};

export async function getCurrentBranch() {
  try {
    const output = await execPromise('git branch --show-current');
    return output.trim();
  } catch (e) {
    throw new Error('Failed to get current branch');
  }
}

export async function checkHasDiffs(pathspec?: string) {
  try {
    const numChangedFilesString = await execPromise(
      `git status ${pathspec ?? ''} --porcelain=v1 2>/dev/null | wc -l`,
    );
    const numChangedFiles = Number(numChangedFilesString.trim());
    return numChangedFiles > 0;
  } catch (e) {
    throw new Error(`Failed to check for diffs in path "${pathspec ?? ''}"`);
  }
}

export async function getDiffFilenames({ staged }: { staged?: boolean }) {
  try {
    return execPromise(`git diff ${staged ? '--staged' : ''} --name-only`);
  } catch (e) {
    throw new Error('Failed to get diff filenames');
  }
}

export async function gitAdd(pathspec?: string) {
  try {
    await execPromise(`git add ${pathspec ?? '--all'}`);
  } catch (e) {
    throw new Error(`Failed to add files in path "${pathspec ?? '--all'}"`);
  }
}

export async function gitCommit({
  message,
  overrideCreds: _overrideCreds,
}: {
  message: string;
  overrideCreds?: { name: string; email: string };
}) {
  try {
    const overrideCreds = _overrideCreds
      ? `-c "user.name=${_overrideCreds.name}" -c "user.email=${_overrideCreds.email}"`
      : '';

    await execPromise(`git ${overrideCreds} commit --message "${message}"`);
  } catch (e) {
    throw new Error('Failed to make git commit');
  }
}

export async function gitPush({
  repository,
  branchName,
}: {
  repository: string;
  branchName?: string;
}) {
  try {
    await execPromise(
      `git push ${repository ?? 'origin'} ${branchName ?? 'master'}`,
    );
  } catch (e) {
    console.error(e);
    throw new Error('Failed to push git commit');
  }
}
