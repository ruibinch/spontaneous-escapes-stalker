import { trackEvent } from '@/analytics';
import { XIcon } from '@/components/icons/x';
import { RouteAnalysisEntry } from '@/index';
import { cn } from '@nextui-org/react';
import routeAnalysisFile from '@/static/route-analysis.json';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import ReactSelect, {
  components,
  ClearIndicatorProps,
  MultiValue,
} from 'react-select';

export type SelectOptions = MultiValue<SelectOption>;

interface SelectOption {
  label: string;
  value: string;
}

export interface AutocompleteSearchTermFilterProps {
  searchTerms: SelectOptions;
  setSearchTerms: Dispatch<SetStateAction<SelectOptions>>;
}

export function AutocompleteSearchTermFilter({
  searchTerms,
  setSearchTerms,
}: AutocompleteSearchTermFilterProps) {
  const searchOptionsList = getSearchOptionsList();
  const searchRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [isSlashTrigger, setSlashTrigger] = useState(false);

  const onInputChange = (value: string) => {
    if (isSlashTrigger) {
      setSlashTrigger(false);
      return;
    }
    setInputValue(value);
  };

  const onChange = (searchTerms: SelectOptions) => {
    trackEvent(['autocompleteSearchTermFilter'], {
      searchTerms: searchTerms.map((term) => term.value).join(','),
    });
    setSearchTerms(searchTerms);
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
    <ReactSelect<SelectOption, true>
      // @ts-expect-error ref type does not match
      ref={searchRef}
      options={searchOptionsList}
      isMulti
      hideSelectedOptions={false}
      backspaceRemovesValue
      placeholder={
        <>
          <kbd className="px-1.5 py-0.5 mr-2 border rounded border-neutral-400">
            /
          </kbd>
          <span>Search by city / country / IATA code</span>
        </>
      }
      inputValue={inputValue}
      onInputChange={onInputChange}
      value={searchTerms}
      onChange={onChange}
      noOptionsMessage={() => <span>{'No results found'}</span>}
      unstyled
      className="w-full"
      classNames={{
        control: () =>
          'pl-2 pr-1 md:pr-2 rounded-md bg-default-100 hover:bg-default-200/50 dark:bg-neutral-800 dark:hover:bg-neutral-700/50 hover:cursor-text',
        placeholder: () => 'pl-1 text-sm text-foreground-500',
        input: () => 'pl-1',
        valueContainer: () => 'py-3 gap-1.5',
        multiValue: () =>
          'bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-500 rounded items-center px-2 gap-2 -my-0.5 text-small',
        multiValueLabel: () => 'leading-6 py-0.5',
        multiValueRemove: () =>
          'border border-gray-200 bg-neutral-50 dark:bg-neutral-200 hover:bg-red-50 hover:text-red-800 text-neutral-500 hover:border-red-300 rounded-md',
        indicatorsContainer: () => 'gap-1',
        clearIndicator: () =>
          'text-neutral-500 dark:text-neutral-200 p-1 rounded-md hover:bg-red-100 hover:dark:bg-red-500/50 hover:text-red-800 hover:cursor-pointer',
        // indicatorSeparator: () => 'bg-gray-300 dark:bg-gray-500',
        // dropdownIndicator: () =>
        //   'p-1 hover:bg-gray-200 hover:dark:bg-gray-500 text-neutral-500 dark:text-neutral-200 rounded-md hover:cursor-pointer',
        menu: () =>
          'mt-2 p-1 border border-gray-300 dark:border-gray-500 rounded-lg bg-neutral-50 dark:bg-neutral-800',
        menuList: ({ children }) => {
          // automatically highlight option if there is only one
          return Array.isArray(children) && children.length === 1
            ? 'bg-blue-200 dark:bg-blue-400 rounded-md'
            : '';
        },
        option: ({ isFocused, isSelected }) =>
          cn(
            'text-sm px-3 py-1 rounded-md',
            isFocused && 'bg-blue-200 dark:bg-blue-400 rounded-md',
            isSelected && 'font-bold',
          ),
      }}
      components={{
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null,
        ClearIndicator: (props: ClearIndicatorProps<SelectOption, true>) => (
          <components.ClearIndicator {...props}>
            <XIcon width={16} height={16} />
          </components.ClearIndicator>
        ),
      }}
      styles={{
        input: (base) => ({
          ...base,
          'input:focus': {
            boxShadow: 'none',
          },
        }),
        // On mobile, the label will truncate automatically, so we want to
        // override that behaviour.
        multiValueLabel: (base) => ({
          ...base,
          whiteSpace: 'normal',
          overflow: 'visible',
        }),
        control: (base) => ({
          ...base,
          transition: 'none',
        }),
        menu: (base) => ({
          ...base,
          zIndex: 100, // ensure it draws at the top
        }),
        option: (base) => ({
          ...base,
          fontSize: '0.875rem', // manually align with `text-sm` to override the default `font-size: inherit` style
        }),
      }}
    />
  );
}

function getSearchOptionsList() {
  const routeAnalysisList = routeAnalysisFile as RouteAnalysisEntry[];

  const citiesList = routeAnalysisList.reduce(
    (_citiesList: Set<string>, routeAnalysisEntry) => {
      _citiesList.add(routeAnalysisEntry.from);
      _citiesList.add(routeAnalysisEntry.to);
      return _citiesList;
    },
    new Set(''),
  );
  const countriesList = routeAnalysisList.reduce(
    (_countriesList: Set<string>, routeAnalysisEntry) => {
      _countriesList.add(routeAnalysisEntry.fromCountry);
      _countriesList.add(routeAnalysisEntry.toCountry);
      return _countriesList;
    },
    new Set(''),
  );
  const iataList = routeAnalysisList.reduce(
    (_iataList: Set<string>, routeAnalysisEntry) => {
      _iataList.add(routeAnalysisEntry.fromIata);
      _iataList.add(routeAnalysisEntry.toIata);
      return _iataList;
    },
    new Set(''),
  );
  const searchTermsList = Array.from(
    new Set([
      ...Array.from(citiesList).sort(),
      ...Array.from(countriesList).sort(),
      ...Array.from(iataList).sort(),
    ]),
  );

  return searchTermsList.map((term) => ({
    label: term,
    value: term,
  }));
}
