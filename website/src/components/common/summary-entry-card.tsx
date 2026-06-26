import { useMounted } from '@/hooks/use-mounted';
import { Skeleton, cn } from '@heroui/react';
import React from 'react';
import { CommonStyles } from './styles';

export function SummaryEntryCard({
  cardBodyClassName,
  header,
  content,
  contentClassName,
  subcontent,
  badgeContent,
  showSkeletonOnCard,
  skeletonCardClassName,
  showSkeletonOnBadge,
  skeletonBadgeClassName,
}: {
  cardBodyClassName?: string;
  header: string;
  content: string | number | React.ReactNode;
  contentClassName?: string;
  subcontent?: string | number;
  badgeContent?: string;
  showSkeletonOnCard?: boolean;
  skeletonCardClassName?: string;
  showSkeletonOnBadge?: boolean;
  skeletonBadgeClassName?: string;
}) {
  const isMounted = useMounted();

  return (
    <div className="flex flex-col rounded-lg border border-border bg-surface p-4 gap-2">
      <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
        {header}
      </span>

      {showSkeletonOnCard && !isMounted ? (
        <Skeleton
          className={cn(
            CommonStyles.Skeleton,
            'w-16 h-8',
            skeletonCardClassName,
          )}
        />
      ) : (
        <div className={cardBodyClassName ?? ''}>
          <div
            className={
              React.isValidElement(content) ? '' : 'flex flex-col'
            }
          >
            {React.isValidElement(content) ? (
              content
            ) : (
              <span
                className={contentClassName ?? 'text-stat text-text-primary'}
              >
                {content}
              </span>
            )}

            {subcontent && (
              <span className="text-xs text-text-muted">{subcontent}</span>
            )}

            {badgeContent && (
              <BadgeContent
                badgeContent={badgeContent}
                showSkeletonOnBadge={showSkeletonOnBadge}
                skeletonBadgeClassName={skeletonBadgeClassName}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BadgeContent({
  badgeContent,
  showSkeletonOnBadge,
  skeletonBadgeClassName,
}: {
  badgeContent: string;
  showSkeletonOnBadge: boolean | undefined;
  skeletonBadgeClassName: string | undefined;
}) {
  const isMounted = useMounted();

  return showSkeletonOnBadge && !isMounted ? (
    <Skeleton
      className={cn(
        CommonStyles.Skeleton,
        'mt-1 w-20 h-5',
        skeletonBadgeClassName,
      )}
    />
  ) : (
    <span
      className={cn(
        'mt-1 inline-flex px-2 py-0.5 text-2xs rounded-md w-fit',
        'bg-accent-subtle text-accent',
      )}
    >
      {badgeContent}
    </span>
  );
}
