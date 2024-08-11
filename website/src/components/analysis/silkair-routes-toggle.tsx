import { useSilkairRoutesToggleContext } from '@/contexts/silkair-routes-toggle-context';
import { Switch, cn } from '@nextui-org/react';
import { CheckIcon } from '../icons/check';
import { XIcon } from '../icons/x';

export function SilkairRoutesToggle() {
  const { showSilkairRoutes, toggleShowSilkairRoutes } =
    useSilkairRoutesToggleContext();

  return (
    <Switch
      defaultSelected
      size="sm"
      isSelected={showSilkairRoutes}
      onChange={() => {
        toggleShowSilkairRoutes();
      }}
      thumbIcon={({ isSelected, className }) =>
        isSelected ? (
          <CheckIcon className={className} />
        ) : (
          <XIcon className={className} />
        )
      }
      classNames={{
        wrapper: cn('bg-red-600 group-data-[selected=true]:bg-green-600'),
      }}
    >
      Show SilkAir routes
    </Switch>
  );
}
