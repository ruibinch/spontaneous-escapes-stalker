import React, { createContext, useContext } from 'react';

interface SidebarContext {
  collapsed: boolean;
}

const SidebarContext = createContext<SidebarContext>({
  collapsed: false,
});

export const useSidebarContext = () => {
  return useContext(SidebarContext);
};

export const SidebarContextProvider = (props: {
  children: React.ReactNode;
}) => {
  const [sidebarOpen] = React.useState(false);
  return (
    <SidebarContext.Provider value={{ collapsed: sidebarOpen }}>
      {props.children}
    </SidebarContext.Provider>
  );
};
