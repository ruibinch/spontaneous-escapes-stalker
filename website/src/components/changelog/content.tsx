import { MarkdownWrapper } from '../common/markdown-wrapper';
import { PageHeader } from '../common/page-header';

// TODO: add notification icon beside changelog icon when there's a new entry
export function ChangelogContent({ content }: { content: string }) {
  return (
    <div>
      <PageHeader title="Changelog" />

      <div className="max-w-[90rem] pb-8 px-4 lg:px-6">
        <MarkdownWrapper content={content} />
      </div>
    </div>
  );
}
