interface Props {
  title: string;
}

export function PageHeader({ title }: Props) {
  return (
    <div className="bg-neutral-50 p-6 border-b-2">
      <h1 className="text-2xl font-semibold">{title}</h1>
    </div>
  );
}
