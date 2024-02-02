import { MarkdownWrapper } from '../common/markdown-wrapper';
import { PageHeader } from '../common/page-header';

export function HelpContent({ content }: { content: string }) {
  return (
    <div>
      <PageHeader title="Help" />

      <div className="max-w-[90rem] pb-8 px-4 lg:px-6">
        <MarkdownWrapper content={content} />
      </div>
    </div>
  );
}
