export function ChartWrapper({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border border-neutral-250 p-2 rounded-md">
      <span className="text-sm">{title}</span>

      <div className="h-40 xl:h-48 overflow-hidden">{children}</div>
    </div>
  );
}
