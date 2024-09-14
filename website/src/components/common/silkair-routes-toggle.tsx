import { useSilkairRoutesToggleContext } from '@/contexts/silkair-routes-toggle-context';
import { Checkbox } from '@nextui-org/react';

export function SilkairRoutesToggle() {
  const { showSilkairRoutes, setShowSilkairRoutes } =
    useSilkairRoutesToggleContext();

  const handleValueChange = (value: boolean) => {
    setShowSilkairRoutes(value);
  };

  return (
    <Checkbox
      size="sm"
      isSelected={showSilkairRoutes}
      onValueChange={handleValueChange}
    >
      Show SilkAir routes
    </Checkbox>
  );
}
