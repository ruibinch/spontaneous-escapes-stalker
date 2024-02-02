import { createContext, useContext } from 'react';

interface SidebarContext {
  collapsed: boolean;
}

export const SidebarContext = createContext<SidebarContext>({
  collapsed: false,
});

export const useSidebarContext = () => {
  return useContext(SidebarContext);
};
