import { cn } from '@heroui/react';
import React from 'react';

export function AlertNotification({
  title,
  content,
  style,
}: {
  title?: string;
  content: React.ReactNode;
  style?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 p-3 rounded-md',
        'bg-amber-200/30 dark:bg-indigo-950',
        'border border-amber-300 dark:border-indigo-700',
        style,
      )}
    >
      {title && <h2 className="font-semibold">{title}</h2>}

      {content}
    </div>
  );
}
