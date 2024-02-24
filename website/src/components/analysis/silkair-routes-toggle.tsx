import { Switch, cn } from '@nextui-org/react';
import React, { ReactNode, createContext, useContext, useState } from 'react';
import { CheckIcon } from '../icons/check';
import { XIcon } from '../icons/x';

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
      setShowSilkairRoutes(!showSilkairRoutes);
    },
  };

  return (
    <SilkairRoutesToggleContext.Provider value={value}>
      {props.children}
    </SilkairRoutesToggleContext.Provider>
  );
};

export function SilkairRoutesToggle() {
  const { showSilkairRoutes, toggleShowSilkairRoutes } =
    useSilkairRoutesToggleContext();

  return (
    <Switch
      defaultSelected
      size="sm"
      isSelected={showSilkairRoutes}
      onChange={() => {
        toggleShowSilkairRoutes();
      }}
      thumbIcon={({ isSelected, className }) =>
        isSelected ? (
          <CheckIcon className={className} />
        ) : (
          <XIcon className={className} />
        )
      }
      classNames={{
        wrapper: cn('bg-red-600 group-data-[selected=true]:bg-green-600'),
      }}
    >
      Show SilkAir routes
    </Switch>
  );
}
