import { trackEvent } from '@/analytics';
import { Select, SelectItem } from '@nextui-org/react';
import { usePathname } from 'next/navigation';
import { ChangeEvent, Dispatch, SetStateAction } from 'react';

export interface RegionFilterProps {
  regions: string;
  setRegions: Dispatch<SetStateAction<string>>;
}

const regionsList = [
  'South East Asia',
  'North Asia',
  'South Asia',
  'Middle East & Africa',
  'Southwest Pacific',
  'Europe',
  'USA',
] as const;
const regionsListWithAll = ['All', ...regionsList] as const;

export function RegionFilter({ regions, setRegions }: RegionFilterProps) {
  const pathname = usePathname();

  // Do some manual tweaking of the selected regions list so that "All" option is correctly handled
  const tweakSelectedRegions = (value: string) => {
    if (value === '') {
      return 'All';
    }
    const selectedRegions = value.split(',');
    const lastSelectedRegion = selectedRegions[selectedRegions.length - 1];
    if (lastSelectedRegion === 'All') {
      return 'All';
    }
    const isAllRegionsSelected = regionsList.every((region) =>
      selectedRegions.includes(region),
    );
    if (isAllRegionsSelected) {
      return 'All';
    }
    return selectedRegions.filter((region) => region !== 'All').join(',');
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
      selectedKeys={regions.split(',')}
      onChange={(e) => {
        const selectedRegions = tweakSelectedRegions(e.target.value);
        trackEvent(['regionFilter'], { pathname, selectedRegions });
        setRegions(selectedRegions);
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
