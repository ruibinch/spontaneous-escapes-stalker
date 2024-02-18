interface Props {
  breadcrumbs?: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function PageHeader({ breadcrumbs, title, subtitle }: Props) {
  return (
    <div className="bg-neutral-50 p-6 border-b-2 flex flex-col gap-3">
      {breadcrumbs}

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle && <h1 className="text-sm">{subtitle}</h1>}
      </div>
    </div>
  );
}
