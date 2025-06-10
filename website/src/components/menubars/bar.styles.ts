import { cn, tv } from '@heroui/react';

export const SidebarWrapper = tv({
  base: cn(
    'bg-gradient-to-r from-blue-900 to-indigo-900',
    'transition-transform fixed h-full -translate-x-full shrink-0',
    'w-52 border-r border-divider flex-col px-3',
    'lg:flex lg:static lg:h-screen lg:translate-x-0',
  ),

  variants: {
    collapsed: {
      true: 'translate-x-0 [display:inherit]',
    },
  },
});

export const BarItem = tv({
  variants: {
    isActive: {
      true: 'bg-neutral-300/25 text-white',
      false:
        'text-neutral-300/75 hover:bg-neutral-300/25 hover:dark:bg-neutral-300/25 hover:text-white',
    },
  },
});

export const BarStyles = {
  SidebarWrapper,
  BarItem,
};
