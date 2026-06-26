import { cn, tv } from '@heroui/react';

const Page = tv({
  base: 'max-w-[90rem] mx-auto pt-8 pb-16 px-4 sm:px-6 lg:px-8',
});

const Border = cn('border-border');

const CardWrapper = cn(
  'flex flex-col gap-3 p-4 rounded-lg border bg-surface',
  'border-border',
);

const Link = cn('text-accent hover:text-accent-hover');

const Skeleton = cn('bg-neutral-100 dark:bg-slate-700 rounded-lg');

const SectionTitle = cn('text-lg font-semibold text-text-primary');

const SectionSubtitle = cn('text-sm text-text-secondary');

export const CommonStyles = {
  Page,
  Border,
  CardWrapper,
  Link,
  Skeleton,
  SectionTitle,
  SectionSubtitle,
};
