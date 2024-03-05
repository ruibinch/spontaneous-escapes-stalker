import { Button, VisuallyHidden, useSwitch } from '@nextui-org/react';
import { useTheme } from 'next-themes';
import { SunIcon } from '../icons/sun';
import { MoonIcon } from '../icons/moon';
import { TooltipCustom } from '../common/tooltip-custom';

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
        className="w-full text-neutral-300/75 hover:text-white"
      >
        {resolvedTheme === 'light' ? <SunIcon /> : <MoonIcon />}
      </Button>
    </TooltipCustom>
  );
}
