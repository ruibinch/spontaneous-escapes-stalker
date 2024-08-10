import { Card, CardHeader, Divider, CardBody } from '@nextui-org/react';
import React from 'react';

export function SummaryEntryCard({
  cardBodyClassName,
  header,
  content,
  contentClassName,
  subcontent,
}: {
  cardBodyClassName?: string;
  header: string;
  content: string | number | React.ReactNode;
  contentClassName?: string;
  subcontent?: string | number;
}) {
  return (
    <Card shadow="sm" radius="sm">
      <CardHeader className="justify-center text-sm">{header}</CardHeader>
      <Divider />
      <CardBody className={cardBodyClassName ?? 'items-center'}>
        {React.isValidElement(content) ? (
          content
        ) : (
          <span className={contentClassName ?? 'text-2xl font-semibold'}>
            {content}
          </span>
        )}
        {subcontent && <span className="text-2xs">{subcontent}</span>}
      </CardBody>
    </Card>
  );
}
