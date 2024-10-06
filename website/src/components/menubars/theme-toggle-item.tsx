import { trackEvent } from '@/analytics';
import { Button, cn } from '@nextui-org/react';
import { Tooltip } from '../common/tooltip';
import { useTheme } from '../common/use-theme';
import { MoonIcon } from '../icons/moon';
import { SunIcon } from '../icons/sun';

export function ThemeToggleItem() {
  const { setTheme, isDarkTheme } = useTheme();

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
          'text-neutral-300/75 lg:hover:bg-neutral-300/25 lg:hover:dark:bg-neutral-300/25 lg:hover:text-white', // BarStyles.Active without the hover: classes in navbar display
        )}
      >
        {isDarkTheme ? <MoonIcon /> : <SunIcon />}
      </Button>
    </Tooltip>
  );
}
