import React from 'react';
import { NavbarWrapper } from '../components/menubars/navbar';
import { SidebarWrapper } from '../components/menubars/sidebar';
import { SidebarContext } from './layout-context';
import { SilkairRoutesToggleContextProvider } from '@/components/analysis/silkair-routes-toggle';

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

          <SilkairRoutesToggleContextProvider>
            {children}
          </SilkairRoutesToggleContextProvider>
        </div>
      </section>
    </SidebarContext.Provider>
  );
};
