import { NoDataIllustration } from '@/components/icons/no-data';

export default function RouteNotFound() {
  return (
    <div className="pt-12 px-4">
      <div className="flex flex-col gap-16 items-center justify-center">
        <NoDataIllustration className="w-1/2 h-1/2" />

        <h1 className="text-2xl font-semibold">Invalid route</h1>
      </div>
    </div>
  );
}