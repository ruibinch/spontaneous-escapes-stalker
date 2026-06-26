import { cn, tv } from '@heroui/react';

export const SidebarWrapper = tv({
  base: cn(
    'bg-nav-bg border-r border-border',
    'transition-transform fixed h-full -translate-x-full shrink-0',
    'w-56 flex-col px-3',
    'lg:flex lg:static lg:h-screen lg:translate-x-0',
  ),

  variants: {
    collapsed: {
      true: 'translate-x-0 [display:inherit]',
    },
  },
});

export const BarItem = tv({
  base: 'rounded-lg transition-colors duration-150',
  variants: {
    isActive: {
      true: 'w-full bg-nav-active-bg text-nav-text-active font-medium',
      false: 'w-full text-nav-text hover:bg-nav-hover hover:text-nav-text-active',
    },
  },
});

export const BarStyles = {
  SidebarWrapper,
  BarItem,
};
