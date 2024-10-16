import { Card, CardHeader, Divider, CardBody, cn } from '@nextui-org/react';
import React from 'react';
import { Skeleton } from './skeleton';

export function SummaryEntryCard({
  cardBodyClassName,
  header,
  content,
  contentClassName,
  subcontent,
  badgeContent,
  isLoaded,
}: {
  cardBodyClassName?: string;
  header: string;
  content: string | number | React.ReactNode;
  contentClassName?: string;
  subcontent?: string | number;
  badgeContent?: string;
  isLoaded: boolean;
}) {
  return (
    <Card shadow="sm" radius="sm">
      <CardHeader className="justify-center text-sm">{header}</CardHeader>
      <Divider />
      <CardBody className={cardBodyClassName ?? 'items-center'}>
        <Skeleton isLoaded={isLoaded}>
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
              <div
                className={cn(
                  'mt-1.5 px-2 py-0.5 text-2xs rounded-lg',
                  'bg-amber-700/75 dark:bg-amber-700 text-neutral-50 dark:text-neutral-200',
                )}
              >
                <span>{badgeContent}</span>
              </div>
            )}
          </div>
        </Skeleton>
      </CardBody>
    </Card>
  );
}
