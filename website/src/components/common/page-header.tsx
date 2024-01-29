interface Props {
  breadcrumbs?: React.ReactNode;
  title: string;
}

export function PageHeader({ breadcrumbs, title }: Props) {
  return (
    <div className="bg-neutral-50 p-6 border-b-2 flex flex-col gap-3">
      {breadcrumbs}

      <h1 className="text-2xl font-semibold">{title}</h1>
    </div>
  );
}
