import { cn, tv } from '@nextui-org/react';

const Page = tv({
  base: 'max-w-[90rem] pt-6 pb-12 px-4 lg:px-6',
});

const Border = cn('border-neutral-200 dark:border-neutral-500');

export const CommonStyles = { Page, Border };
