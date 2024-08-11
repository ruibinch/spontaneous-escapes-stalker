import React, { ReactNode, createContext, useContext, useState } from 'react';

interface SilkairRoutesToggleContext {
  showSilkairRoutes: boolean;
  toggleShowSilkairRoutes: () => void;
}

const SilkairRoutesToggleContext = createContext<SilkairRoutesToggleContext>({
  showSilkairRoutes: true,
  toggleShowSilkairRoutes: () => {},
});

export const useSilkairRoutesToggleContext = () => {
  return useContext(SilkairRoutesToggleContext);
};

export const SilkairRoutesToggleContextProvider = (props: {
  children: ReactNode;
}) => {
  const [showSilkairRoutes, setShowSilkairRoutes] = useState(true);

  const value = {
    showSilkairRoutes,
    toggleShowSilkairRoutes: () => {
      const showSilkairRoutesUpd = !showSilkairRoutes;
      setShowSilkairRoutes(showSilkairRoutesUpd);
    },
  };

  return (
    <SilkairRoutesToggleContext.Provider value={value}>
      {props.children}
    </SilkairRoutesToggleContext.Provider>
  );
};
