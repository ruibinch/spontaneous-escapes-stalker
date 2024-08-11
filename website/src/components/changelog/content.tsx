'use client';
import { useNewChangelogItemContext } from '@/contexts/new-changelog-item-context';
import { useEffect } from 'react';
import { MarkdownWrapper } from '../common/markdown-wrapper';
import { PageHeader } from '../common/page-header';

export function ChangelogContent({ content }: { content: string }) {
  const { markItemAsViewed } = useNewChangelogItemContext();

  useEffect(() => {
    markItemAsViewed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <PageHeader title="Changelog" />

      <div className="max-w-[90rem] pb-8 px-4 lg:px-6">
        <MarkdownWrapper content={content} />
      </div>
    </div>
  );
}
