import { trackEvent } from '@/analytics';
import useDebounce from '@/hooks/use-debounce';
import { Input, cn } from '@nextui-org/react';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { CommonStyles } from '../styles';

export interface SearchTermFilterProps {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  placeholder: string;
  useBasicDesign?: boolean;
}

export function SearchTermFilter({
  searchTerm,
  setSearchTerm,
  placeholder,
  useBasicDesign = false,
}: SearchTermFilterProps) {
  const [value, setValue] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const [isSlashTrigger, setSlashTrigger] = useState(false);

  useEffect(() => {
    setValue(searchTerm);
  }, [searchTerm]);

  useDebounce(
    () => {
      const searchKeyword = value.toLowerCase();
      trackEvent(['searchTermFilter'], { searchKeyword });
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
        input: 'w-full placeholder:text-xs placeholder:sm:text-sm',
        inputWrapper: useBasicDesign
          ? cn(
              CommonStyles.Border,
              'bg-default-50 data-[hover=true]:bg-default-100 border h-8',
            )
          : '',
        mainWrapper: 'w-full',
      }}
      startContent={
        !useBasicDesign && (
          <kbd className="px-1.5 mr-1 bg-neutral-100 dark:bg-neutral-700 border rounded border-neutral-400 text-small text-foreground-500">
            /
          </kbd>
        )
      }
      placeholder={placeholder}
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
