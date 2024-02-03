import { ChangelogContent } from '@/components/changelog/content';
import fs from 'fs';
import path from 'path';

export default function Help() {
  const changelogMarkdownFilepath = path.join(
    process.cwd(),
    'src',
    'docs',
    'changelog.md',
  );
  const changelogMarkdownFileContent = fs.readFileSync(
    changelogMarkdownFilepath,
    'utf8',
  );

  return <ChangelogContent content={changelogMarkdownFileContent} />;
}
