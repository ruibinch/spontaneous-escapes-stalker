import { useTheme as useNextTheme } from 'next-themes';

export const useTheme = () => {
  const useNextThemeProps = useNextTheme();
  const resolvedTheme =
    useNextThemeProps.resolvedTheme === 'light' ? 'light' : ('dark' as const);

  return {
    ...useNextThemeProps,
    resolvedTheme,
    isDarkTheme: resolvedTheme === 'dark',
    isThemeLoaded: useNextThemeProps.resolvedTheme !== undefined,
  };
};
