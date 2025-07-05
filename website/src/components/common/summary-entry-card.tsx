import { useMounted } from '@/hooks/use-mounted';
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Skeleton,
  cn,
} from '@heroui/react';
import React, { useEffect, useState } from 'react';
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
    <Card shadow="sm" radius="sm">
      <CardHeader className="justify-center text-sm">{header}</CardHeader>
      <Divider />
      {showSkeletonOnCard && !isMounted ? (
        <CardBody className="items-center">
          <Skeleton
            className={cn(
              CommonStyles.Skeleton,
              'w-16 h-8',
              skeletonCardClassName,
            )}
          />
        </CardBody>
      ) : (
        <CardBody className={cardBodyClassName ?? 'items-center'}>
          <div
            // disable styling if content is a React element as content might have its own styling
            className={
              React.isValidElement(content) ? '' : 'flex flex-col items-center'
            }
          >
            {React.isValidElement(content) ? (
              content
            ) : (
              <span className={contentClassName ?? 'text-2xl font-semibold'}>
                {content}
              </span>
            )}

            {subcontent && <span className="text-2xs">{subcontent}</span>}

            {badgeContent && (
              <BadgeContent
                badgeContent={badgeContent}
                showSkeletonOnBadge={showSkeletonOnBadge}
                skeletonBadgeClassName={skeletonBadgeClassName}
              />
            )}
          </div>
        </CardBody>
      )}
    </Card>
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
        'mt-1.5 w-20 h-5',
        skeletonBadgeClassName,
      )}
    />
  ) : (
    <div
      className={cn(
        'mt-1.5 px-2 py-0.5 text-2xs rounded-lg',
        'bg-amber-700/75 dark:bg-amber-700 text-neutral-50 dark:text-neutral-200',
      )}
    >
      <span>{badgeContent}</span>
    </div>
  );
}
