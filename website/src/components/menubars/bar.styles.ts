import { cn, tv } from '@nextui-org/react';

export const SidebarWrapper = tv({
  base: cn(
    'bg-gradient-to-r from-blue-900 to-indigo-900',
    'transition-transform h-full fixed -translate-x-full w-56 shrink-0 overflow-y-auto border-r border-divider flex-col py-6 px-3 lg:ml-0 lg:flex lg:static lg:h-screen lg:translate-x-0',
  ),

  variants: {
    collapsed: {
      true: 'translate-x-0 ml-0 [display:inherit]',
    },
  },
});

export const BarItem = tv({
  variants: {
    isActive: {
      true: 'bg-neutral-300/25 text-white',
      false: 'hover:bg-neutral-300/25 text-neutral-300/75  hover:text-white',
    },
  },
});

export const BarStyles = {
  SidebarWrapper,
  BarItem,
};
