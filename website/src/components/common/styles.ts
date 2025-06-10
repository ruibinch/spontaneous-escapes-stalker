import { cn, tv } from '@heroui/react';

const Page = tv({
  base: 'max-w-[90rem] pt-6 pb-12 px-4 lg:px-6',
});

const Border = cn('border-neutral-250 dark:border-neutral-500');

const CardWrapper = cn(
  'flex flex-col gap-2 p-2 rounded-md shadow-md border',
  Border,
);

const Link = cn('text-blue-500 dark:text-blue-400 hover:text-blue-600');

export const CommonStyles = { Page, Border, CardWrapper, Link };
