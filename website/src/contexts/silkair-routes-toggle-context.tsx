import { IS_SERVER } from '@/common/env';
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'showSilkairRoutes';

interface SilkairRoutesToggleContext {
  showSilkairRoutes: boolean;
  setShowSilkairRoutes: (value: boolean) => void;
}

const SilkairRoutesToggleContext = createContext<SilkairRoutesToggleContext>({
  showSilkairRoutes: true,
  setShowSilkairRoutes: () => {},
});

export const useSilkairRoutesToggleContext = () => {
  return useContext(SilkairRoutesToggleContext);
};

export const SilkairRoutesToggleContextProvider = (props: {
  children: ReactNode;
}) => {
  const [showSilkairRoutes, setShowSilkairRoutesState] = useState(() =>
    getShowSilkairRoutes(),
  );

  const setShowSilkairRoutes = useCallback(
    (value: boolean) => {
      setShowSilkairRoutesState(value);

      try {
        localStorage.setItem(STORAGE_KEY, String(value));
      } catch (e) {
        // unsupported
      }
    },
    [setShowSilkairRoutesState],
  );

  // localStorage event handling
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;

      // e.newValue is null if key is deleted
      const valueUpd = e.newValue === null || e.newValue === 'true';
      setShowSilkairRoutes(valueUpd);
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [setShowSilkairRoutes]);

  const providerValue = useMemo(
    () => ({
      showSilkairRoutes,
      setShowSilkairRoutes,
    }),
    [showSilkairRoutes, setShowSilkairRoutes],
  );

  return (
    <SilkairRoutesToggleContext.Provider value={providerValue}>
      {props.children}
    </SilkairRoutesToggleContext.Provider>
  );
};

/**
 * @returns `true` if the value is not saved, else returns the saved value
 */
const getShowSilkairRoutes = () => {
  // check relies on localStorage so can only be done on client-side
  if (IS_SERVER) return true;

  try {
    const savedValue = localStorage.getItem(STORAGE_KEY);
    return savedValue === null || savedValue === 'true';
  } catch (e) {
    return true;
  }
};
