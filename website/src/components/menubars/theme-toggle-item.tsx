'use client';
import { trackEvent } from '@/analytics';
import { Button, Skeleton, cn } from '@heroui/react';
import { useEffect, useState } from 'react';
import { Tooltip } from '../common/tooltip';
import { useTheme } from '../common/use-theme';
import { MoonIcon } from '../icons/moon';
import { SunIcon } from '../icons/sun';

export function ThemeToggleItem() {
  const { setTheme, isDarkTheme, isThemeLoaded } = useTheme();
  const [isThemeLoadedLocal, setIsThemeLoadedLocal] = useState(false);

  useEffect(() => {
    setIsThemeLoadedLocal(isThemeLoaded);
  }, [isThemeLoaded]);

  const toggleTheme = () => {
    const themeUpd = isDarkTheme ? 'light' : 'dark';
    trackEvent(['theme', themeUpd]);
    setTheme(themeUpd);
  };

  return (
    <Tooltip content="Toggle theme">
      <Button
        size="sm"
        radius="sm"
        variant="light"
        isIconOnly
        onPress={toggleTheme}
        className={cn(
          'w-full',
          'text-nav-text hover:bg-nav-hover hover:text-nav-text-active',
        )}
      >
        {(() => {
          if (!isThemeLoadedLocal) {
            return (
              <Skeleton className="h-4 w-4 rounded-md bg-neutral-200 dark:bg-slate-600" />
            );
          }
          return isDarkTheme ? <MoonIcon /> : <SunIcon />;
        })()}
      </Button>
    </Tooltip>
  );
}
