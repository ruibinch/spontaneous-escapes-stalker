import useDebounce from '@/hooks/use-debounce';
import { Input } from '@nextui-org/react';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

export interface SearchTermFilterProps {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
}

export function SearchTermFilter({
  searchTerm,
  setSearchTerm,
}: SearchTermFilterProps) {
  const [value, setValue] = useState(searchTerm);
  const searchRef = useRef<HTMLInputElement>(null);
  const [isSlashTrigger, setSlashTrigger] = useState(false);

  useDebounce(
    () => {
      setSearchTerm(value.toLowerCase());
    },
    400,
    [value],
  );

  const onValueChange = (value: string) => {
    if (isSlashTrigger) {
      setSlashTrigger(false);
      return;
    }
    setValue(value);
  };

  useEffect(() => {
    function handleKeyDown(e: DocumentEventMap['keydown']) {
      if (e.key === '/') {
        setSlashTrigger(true);
        searchRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Input
      classNames={{
        input: 'w-full',
        mainWrapper: 'w-full',
      }}
      startContent={
        <kbd className="px-1.5 mr-1 bg-neutral-100 border rounded border-neutral-400 text-small text-foreground-500">
          /
        </kbd>
      }
      placeholder="Filter by city name or IATA code"
      ref={searchRef}
      value={value}
      onValueChange={onValueChange}
    />
  );
}
