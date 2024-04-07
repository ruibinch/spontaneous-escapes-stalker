import { countryCodeMappings } from './countryCodeMappings';
import { cityMappings } from './mappings';

export function getCountryFromCity(city: string) {
  const countryCode = cityMappings[city].countryCode;
  const country = countryCodeMappings[countryCode];
  if (!countryCode || !country) {
    throw new Error(
      `Missing countryCode=${countryCode}/country=${country} for "${city}"`,
    );
  }
  return country;
}
