import { PageNotFoundIllustration } from '@/components/icons/page-not-found';

export default function NotFound() {
  return (
    <div className="flex flex-col mt-8 gap-16 items-center justify-center">
      <PageNotFoundIllustration className="w-2/3 h-2/3" />

      <h1 className="text-2xl font-semibold">Page not found</h1>
    </div>
  );
}
