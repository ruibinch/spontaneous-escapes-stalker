import { cn } from '@heroui/react';

interface Props {
  breadcrumbs?: React.ReactNode;
  title: string;
  subtitle?: string;
  rightComponent?: React.ReactNode;
}

export function PageHeader({
  breadcrumbs,
  title,
  subtitle,
  rightComponent,
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-end justify-between gap-4',
        'pb-6 border-b border-border',
      )}
    >
      <div className="flex flex-col gap-1">
        {breadcrumbs}

        <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>
        {subtitle && (
          <p className="text-sm text-text-secondary">{subtitle}</p>
        )}
      </div>

      {rightComponent && <div className="shrink-0">{rightComponent}</div>}
    </div>
  );
}
