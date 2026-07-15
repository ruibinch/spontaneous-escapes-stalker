import { NewChangelogItemContextProvider } from '@/contexts/new-changelog-item-context';
import { SidebarContextProvider } from '@/contexts/sidebar-context';
import { SilkairRoutesToggleContextProvider } from '@/contexts/silkair-routes-toggle-context';
import React from 'react';
import { NavbarWrapper } from '../components/menubars/navbar';
import { SidebarWrapper } from '../components/menubars/sidebar';

interface Props {
  children: React.ReactNode;
}

export const Layout = ({ children }: Props) => {
  return (
    <SidebarContextProvider>
      <NewChangelogItemContextProvider>
        <SilkairRoutesToggleContextProvider>
          <section className="flex">
            <SidebarWrapper />

            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
              <NavbarWrapper />
              {children}
            </div>
          </section>
        </SilkairRoutesToggleContextProvider>
      </NewChangelogItemContextProvider>
    </SidebarContextProvider>
  );
};
