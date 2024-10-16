import { cn } from '@nextui-org/react';
import { Skeleton } from './skeleton';
import { CommonStyles } from './styles';

interface Props {
  breadcrumbs?: React.ReactNode;
  title: string;
  subtitle?: string;
  // if rightComponent is present, then isLoaded must also be present
  rightComponent?: React.ReactNode;
  isLoaded?: boolean;
}

export function PageHeader({
  breadcrumbs,
  title,
  subtitle,
  rightComponent,
  isLoaded,
}: Props) {
  return (
    <div
      className={cn(
        CommonStyles.Border,
        'grid grid-cols-4 bg-neutral-50 dark:bg-neutral-800 p-6 border-b-2 gap-4 items-end',
      )}
    >
      <div className="col-span-3 gap-3">
        {breadcrumbs}

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {subtitle && <h1 className="text-sm">{subtitle}</h1>}
        </div>
      </div>

      {/* assumes that all rightComponent types are SilkairRoutesToggle; tweak if not so */}
      {rightComponent && (
        <Skeleton className="justify-self-end" isLoaded={isLoaded ?? true}>
          <div>{rightComponent}</div>
        </Skeleton>
      )}
    </div>
  );
}
