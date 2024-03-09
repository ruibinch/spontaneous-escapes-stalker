import { Button, cn } from '@nextui-org/react';
import { TooltipCustom } from '../common/tooltip-custom';
import { useTheme } from '../common/use-theme';
import { MoonIcon } from '../icons/moon';
import { SunIcon } from '../icons/sun';

export function ThemeToggleItem() {
  const { setTheme, isDarkTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(isDarkTheme ? 'light' : 'dark');
  };

  return (
    <TooltipCustom content="Toggle theme" alwaysUseTooltip>
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
    </TooltipCustom>
  );
}
