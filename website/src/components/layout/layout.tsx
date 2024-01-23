import React from 'react';
import { useLockedBody } from '../../hooks/use-locked-body';
import { SidebarWrapper } from '../sidebar/sidebar';
import { SidebarContext } from './layout-context';
import { NavbarWrapper } from '../navbar/navbar';
import { ENABLE_NAVBAR } from '@/env';
import { cn } from '@nextui-org/react';

interface Props {
  children: React.ReactNode;
}

export const Layout = ({ children }: Props) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [_, setLocked] = useLockedBody(false);
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    setLocked(!sidebarOpen);
  };

  return (
    <SidebarContext.Provider
      value={{
        collapsed: sidebarOpen,
        setCollapsed: handleToggleSidebar,
      }}
    >
      <section className="flex">
        <SidebarWrapper />

        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {ENABLE_NAVBAR && <NavbarWrapper />}

          <div
            className={cn(
              'h-full w-full max-w-[90rem] pb-8 px-4 lg:px-6',
              ENABLE_NAVBAR ? 'pt-6' : 'pt-12',
            )}
          >
            {children}
          </div>
        </div>
      </section>
    </SidebarContext.Provider>
  );
};
