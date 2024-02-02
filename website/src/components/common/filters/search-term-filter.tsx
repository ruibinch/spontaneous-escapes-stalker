import { trackEvent } from '@/analytics';
import useDebounce from '@/hooks/use-debounce';
import { Input } from '@nextui-org/react';
import { usePathname } from 'next/navigation';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

export interface SearchTermFilterProps {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
}

export function SearchTermFilter({
  searchTerm,
  setSearchTerm,
}: SearchTermFilterProps) {
  const pathname = usePathname();
  const [value, setValue] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const [isSlashTrigger, setSlashTrigger] = useState(false);

  useEffect(() => {
    setValue(searchTerm);
  }, [searchTerm]);

  useDebounce(
    () => {
      const searchKeyword = value.toLowerCase();
      trackEvent(['searchTermFilter'], { pathname, searchKeyword });
      setSearchTerm(searchKeyword);
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
      size="sm"
      classNames={{
        input: 'w-full',
        mainWrapper: 'w-full',
      }}
      startContent={
        <kbd className="px-1.5 mr-1 bg-neutral-100 border rounded border-neutral-400 text-small text-foreground-500">
          /
        </kbd>
      }
      placeholder="Search by city/IATA"
      ref={searchRef}
      value={value}
      onValueChange={onValueChange}
    />
  );
}

/**
 * Helper function to check for a search term match, given an input list of strings for checking.
 */
export function isSearchTermMatch({
  searchTerm,
  strings,
}: {
  searchTerm: string;
  strings: string[];
}) {
  if (searchTerm === '') return true;

  const searchTermIndivWords = searchTerm.toLowerCase().split(' ');
  return searchTermIndivWords.every((word) => {
    return strings.some((str) => str.toLowerCase().includes(word));
  });
}
