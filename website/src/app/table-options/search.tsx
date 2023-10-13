import { Input } from '@nextui-org/react';
import { useEffect, useRef, useState } from 'react';
import useDebounce from '../../hooks/use-debounce';

export function Search({
  searchTerm,
  onChange,
}: {
  searchTerm: string;
  onChange: (searchTerm: string) => void;
}) {
  const [value, setValue] = useState(searchTerm);
  const searchRef = useRef<HTMLInputElement>(null);
  const [isSlashTrigger, setSlashTrigger] = useState(false);

  useDebounce(
    () => {
      onChange(value.toLowerCase());
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
      placeholder="Search"
      startContent={
        <kbd className="px-1.5 mr-1 bg-neutral-800 border rounded border-neutral-500 text-small text-foreground-500">
          /
        </kbd>
      }
      ref={searchRef}
      value={value}
      onValueChange={onValueChange}
    />
  );
}
