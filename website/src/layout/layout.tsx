import { SilkairRoutesToggleContextProvider } from '@/components/analysis/silkair-routes-toggle';
import { NewChangelogItemContextProvider } from '@/components/common/use-new-changelog-item-context';
import React from 'react';
import { NavbarWrapper } from '../components/menubars/navbar';
import { SidebarWrapper } from '../components/menubars/sidebar';
import { SidebarContext } from './layout-context';

interface Props {
  children: React.ReactNode;
}

export const Layout = ({ children }: Props) => {
  const [sidebarOpen] = React.useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed: sidebarOpen }}>
      {/*  NewChangelogItemContextProvider needs to be defined above the Sidebar/Navbar wrappers */}
      <NewChangelogItemContextProvider>
        <section className="flex">
          <SidebarWrapper />

          <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <NavbarWrapper />

            <SilkairRoutesToggleContextProvider>
              {children}
            </SilkairRoutesToggleContextProvider>
          </div>
        </section>
      </NewChangelogItemContextProvider>
    </SidebarContext.Provider>
  );
};
