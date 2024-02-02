import { HelpContent } from '@/components/help/content';
import fs from 'fs';
import path from 'path';

export default function Help() {
  const helpMarkdownFilepath = path.join(
    process.cwd(),
    'src',
    'docs',
    'help.md',
  );
  const helpMarkdownFileContent = fs.readFileSync(helpMarkdownFilepath, 'utf8');

  return <HelpContent content={helpMarkdownFileContent} />;
}
