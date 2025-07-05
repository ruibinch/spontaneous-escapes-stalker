import { useTheme as useNextTheme } from 'next-themes';

export const useTheme = () => {
  const useNextThemeProps = useNextTheme();
  const resolvedTheme =
    useNextThemeProps.resolvedTheme === 'dark' ? 'dark' : ('light' as const);

  return {
    ...useNextThemeProps,
    resolvedTheme,
    isDarkTheme: resolvedTheme === 'dark',
    isThemeLoaded: useNextThemeProps.resolvedTheme !== undefined,
  };
};
