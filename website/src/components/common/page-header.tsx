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
    <div className="flex bg-neutral-50 p-6 border-b-2 gap-4 items-end">
      <div className="flex flex-col flex-1 gap-3">
        {breadcrumbs}

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {subtitle && <h1 className="text-sm">{subtitle}</h1>}
        </div>
      </div>

      {rightComponent}
    </div>
  );
}
