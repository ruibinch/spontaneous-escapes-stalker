import { trackEvent } from '@/analytics';
import { XIcon } from '@/components/icons/x';
import { useSearchParams } from '@/hooks/use-search-params';
import { RedemptionEntry, RouteAnalysisEntry } from '@/index';
import routeAnalysisFile from '@/static/route-analysis.json';
import { cn } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import ReactSelect, {
  ClearIndicatorProps,
  MultiValue,
  components,
} from 'react-select';

type SelectOptions = MultiValue<SelectOption>;
interface SelectOption {
  label: string;
  value: string;
}

export interface AutocompleteSearchTermFilterProps {
  redemptions?: RedemptionEntry[];
}

export function AutocompleteSearchTermFilter({
  redemptions,
}: AutocompleteSearchTermFilterProps) {
  const { searchParams, generateUrlWithUpdatedSearchParams } =
    useSearchParams();
  const router = useRouter();
  const searchTerms = (searchParams.get('searchTerm')?.split(',') ?? []).map(
    (term) => ({
      label: term,
      value: term,
    }),
  );

  const searchOptionsList = getSearchOptionsList(redemptions);
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
    const searchTermsString = searchTerms.map((term) => term.value).join(',');
    if (searchTerms.length > 0) {
      trackEvent(['autocompleteSearchTermFilter'], {
        searchTerms: searchTermsString,
      });
    }

    const url = generateUrlWithUpdatedSearchParams(
      'searchTerm',
      searchTermsString,
    );
    router.replace(url);
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

/**
 * Returns a list of city/country/IATA search terms.
 *
 * @param redemptions Optional list of redemptions to extract search terms from; if not specified, the full route analysis file is used.
 */
function getSearchOptionsList(inputRedemptions: RedemptionEntry[] | undefined) {
  const redemptions =
    inputRedemptions ?? (routeAnalysisFile as RouteAnalysisEntry[]);

  const citiesList = redemptions.reduce(
    (_citiesList: Set<string>, redemption) => {
      _citiesList.add(redemption.origin);
      _citiesList.add(redemption.destination);
      return _citiesList;
    },
    new Set(''),
  );
  const countriesList = redemptions.reduce(
    (_countriesList: Set<string>, redemption) => {
      _countriesList.add(redemption.originCountry);
      _countriesList.add(redemption.destinationCountry);
      return _countriesList;
    },
    new Set(''),
  );
  const iataList = redemptions.reduce((_iataList: Set<string>, redemption) => {
    _iataList.add(redemption.originIata);
    _iataList.add(redemption.destinationIata);
    return _iataList;
  }, new Set(''));

  const mainSearchTermsList = Array.from(
    new Set([
      ...Array.from(citiesList).sort(),
      ...Array.from(countriesList).sort(),
      ...Array.from(iataList).sort(),
    ]),
  ).map((term) => ({
    label: term,
    value: term,
  }));

  // For cities with multiple airports, we only use the IATA corresponding to the city
  // The individual airport IATAs are thus manually added to facilitate searching
  const iataCustomList = [
    'TFU (CTU)',
    'HND (TYO)',
    'NRT (TYO)',
    'JFK (NYC)',
    'EWR (NYC)',
    'DME (MOW)',
    'SVO (MOW)',
    'LHR (LON)',
    'LGW (LON)',
    'PEK (BJS)',
    'PKX (BJS)',
  ].map((term) => ({
    label: term,
    value: /(?<=\()\w{3}/g.exec(term)?.[0] ?? '', // extract IATA code within the parentheses
  }));

  return [...mainSearchTermsList, ...iataCustomList].sort((a, b) =>
    a.label.localeCompare(b.label),
  );
}

/**
 * Helper function to check for an exact search term match with any of the input strings.
 */
export function isSearchTermExactMatch({
  searchTerm,
  strings,
}: {
  searchTerm: string;
  strings: string[];
}) {
  if (searchTerm === '') return true;

  return strings.some((str) => str === searchTerm);
}
