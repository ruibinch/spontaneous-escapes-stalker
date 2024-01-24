import { cityMappings } from './mappings';

export const iata = (city: string) => {
  const cityIata: string | undefined = cityMappings[city].iata;
  if (!cityIata) {
    throw new Error(`IATA code not found for ${city}`);
  }
  return cityIata;
};
