import { trackEvent } from '@/analytics';
import { useSearchParams } from '@/hooks/use-search-params';
import { Select, SelectItem } from '@nextui-org/react';
import { useRouter } from 'next/navigation';

export const REGION_ALL = 'All';

const regionsList = [
  'South East Asia',
  'North Asia',
  'South Asia',
  'Middle East & Africa',
  'Southwest Pacific',
  'Europe',
  'North America',
] as const;
const regionsListWithAll = [REGION_ALL, ...regionsList] as const;

export function RegionFilter() {
  const { searchParams, generateUrlWithUpdatedSearchParams } =
    useSearchParams();
  const router = useRouter();
  const region = searchParams.get('region') ?? REGION_ALL;

  // Do some manual tweaking of the selected regions list so that "All" option is correctly handled
  const tweakSelectedRegions = (value: string): string => {
    if (value === '') {
      return REGION_ALL;
    }
    const selectedRegions = value.split(',');
    const lastSelectedRegion = selectedRegions[selectedRegions.length - 1];
    if (lastSelectedRegion === REGION_ALL) {
      return lastSelectedRegion;
    }
    const isAllRegionsSelected = regionsList.every((region) =>
      selectedRegions.includes(region),
    );
    if (isAllRegionsSelected) {
      return REGION_ALL;
    }
    return selectedRegions.filter((region) => region !== REGION_ALL).join(',');
  };

  return (
    <Select
      size="sm"
      items={regionsListWithAll.map((region) => ({
        label: region,
        value: region,
      }))}
      label="Region"
      selectionMode="multiple"
      selectedKeys={region.split(',')}
      onChange={(e) => {
        const selectedRegions = tweakSelectedRegions(e.target.value);
        trackEvent(['regionFilter'], { selectedRegions });

        const url = generateUrlWithUpdatedSearchParams(
          'region',
          selectedRegions,
        );
        router.replace(url);
      }}
    >
      {(option) => (
        <SelectItem key={option.label} value={option.value}>
          {option.value}
        </SelectItem>
      )}
    </Select>
  );
}

export function isRegionMatch({
  regionsFiltered,
  region,
}: {
  regionsFiltered: string[];
  region: string;
}) {
  return (
    regionsFiltered.includes(REGION_ALL) || regionsFiltered.includes(region)
  );
}
