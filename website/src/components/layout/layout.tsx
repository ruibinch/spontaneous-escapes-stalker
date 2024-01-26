import { cn } from '@nextui-org/react';
import React from 'react';
import { NavbarWrapper } from '../menubars/navbar';
import { SidebarWrapper } from '../menubars/sidebar';
import { SidebarContext } from './layout-context';

interface Props {
  children: React.ReactNode;
}

export const Layout = ({ children }: Props) => {
  const [sidebarOpen] = React.useState(false);

  return (
    <SidebarContext.Provider
      value={{
        collapsed: sidebarOpen,
      }}
    >
      <section className="flex">
        <SidebarWrapper />

        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <NavbarWrapper />

          {children}
        </div>
      </section>
    </SidebarContext.Provider>
  );
};
