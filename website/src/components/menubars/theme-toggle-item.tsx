import { Button, cn } from '@nextui-org/react';
import { TooltipCustom } from '../common/tooltip-custom';
import { MoonIcon } from '../icons/moon';
import { SunIcon } from '../icons/sun';
import { BarStyles } from './bar.styles';
import { useTheme } from '../common/use-theme';

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
        className={cn('w-full', BarStyles.BarItem({ isActive: false }))}
      >
        {isDarkTheme ? <MoonIcon /> : <SunIcon />}
      </Button>
    </TooltipCustom>
  );
}
