import { useSilkairRoutesToggleContext } from '@/contexts/silkair-routes-toggle-context';
import { useMounted } from '@/hooks/use-mounted';
import { Checkbox, Skeleton, cn } from '@heroui/react';
import { CommonStyles } from './styles';

export function SilkairRoutesToggle() {
  const { showSilkairRoutes, setShowSilkairRoutes } =
    useSilkairRoutesToggleContext();
  const isMounted = useMounted();

  const handleValueChange = (value: boolean) => {
    setShowSilkairRoutes(value);
  };

  if (!isMounted) {
    return <Skeleton className={cn(CommonStyles.Skeleton, 'w-20 h-6')} />;
  }

  return (
    <Checkbox
      size="sm"
      isSelected={showSilkairRoutes}
      onValueChange={handleValueChange}
    >
      Show SilkAir entries
    </Checkbox>
  );
}
