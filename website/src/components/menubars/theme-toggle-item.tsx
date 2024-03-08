import { Button, cn } from '@nextui-org/react';
import { useTheme } from 'next-themes';
import { TooltipCustom } from '../common/tooltip-custom';
import { MoonIcon } from '../icons/moon';
import { SunIcon } from '../icons/sun';
import { BarStyles } from './bar.styles';

export function ThemeToggleItem() {
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
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
        {resolvedTheme === 'light' ? <SunIcon /> : <MoonIcon />}
      </Button>
    </TooltipCustom>
  );
}
