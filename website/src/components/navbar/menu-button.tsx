import React from 'react';
import { useSidebarContext } from '../layout/layout-context';
import { MenuIcon } from '../icons/menu';

export const MenuButton = () => {
  const { setCollapsed } = useSidebarContext();

  return (
    <div className="cursor-pointer" onClick={setCollapsed}>
      <MenuIcon />
    </div>
  );
};
