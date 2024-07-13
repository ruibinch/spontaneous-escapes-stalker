import { Region } from '../../utils/types';

// Mapping of city name to IATA code, country code and standardised region name
// prettier-ignore
export const cityMappings: Record<
  string,
  { iata: string; countryCode: string; region: string }
> = {
  Adelaide: { iata: 'ADL', countryCode: 'AU', region: Region.SOUTHWEST_PACIFIC },
  Ahmedabad: { iata: 'AMD', countryCode: 'IN', region: Region.SOUTH_ASIA },
  Amsterdam: { iata: 'AMS', countryCode: 'NL', region: Region.EUROPE },
  Auckland: { iata: 'AKL', countryCode: 'NZ', region: Region.SOUTHWEST_PACIFIC },
  Bali: { iata: 'DPS', countryCode: 'ID', region: Region.SOUTH_EAST_ASIA },
  Balikpapan: { iata: 'BPN', countryCode: 'ID', region: Region.SOUTH_EAST_ASIA },
  'Bandar Seri Begawan': { iata: 'BWN', countryCode: 'BN', region: Region.SOUTH_EAST_ASIA },
  Bandung: { iata: 'BDO', countryCode: 'ID', region: Region.SOUTH_EAST_ASIA },
  Bangkok: { iata: 'BKK', countryCode: 'TH', region: Region.SOUTH_EAST_ASIA },
  Barcelona: { iata: 'BCN', countryCode: 'ES', region: Region.EUROPE },
  Beijing: { iata: 'PEK', countryCode: 'CN', region: Region.NORTH_ASIA },
  Bangalore: { iata: 'BLR', countryCode: 'IN', region: Region.SOUTH_ASIA },
  Brisbane: { iata: 'BNE', countryCode: 'AU', region: Region.SOUTHWEST_PACIFIC },
  Broome: { iata: 'BME', countryCode: 'AU', region: Region.SOUTHWEST_PACIFIC },
  Brussels: { iata: 'BRU', countryCode: 'BE', region: Region.EUROPE },
  Busan: { iata: 'PUS', countryCode: 'KR', region: Region.NORTH_ASIA },
  Cairns: { iata: 'CNS', countryCode: 'AU', region: Region.SOUTHWEST_PACIFIC },
  Canberra: { iata: 'CBR', countryCode: 'AU', region: Region.SOUTHWEST_PACIFIC },
  'Cape Town': { iata: 'CPT', countryCode: 'ZA', region: Region.MIDDLE_EAST_AND_AFRICA },
  Cebu: { iata: 'CEB', countryCode: 'PH', region: Region.SOUTH_EAST_ASIA },
  Changsha: { iata: 'CSX', countryCode: 'CN', region: Region.NORTH_ASIA },
  Chengdu: { iata: 'CTU', countryCode: 'CN', region: Region.NORTH_ASIA },
  Chennai: { iata: 'MAA', countryCode: 'IN', region: Region.SOUTH_ASIA },
  'Chiang Mai': { iata: 'CNX', countryCode: 'TH', region: Region.SOUTH_EAST_ASIA },
  Chongqing: { iata: 'CKG', countryCode: 'CN', region: Region.NORTH_ASIA },
  Chitose: { iata: 'CTS', countryCode: 'JP', region: Region.NORTH_ASIA },
  Christchurch: { iata: 'CHC', countryCode: 'NZ', region: Region.SOUTHWEST_PACIFIC },
  Coimbatore: { iata: 'CJB', countryCode: 'IN', region: Region.SOUTH_ASIA },
  Colombo: { iata: 'CMB', countryCode: 'LK', region: Region.SOUTH_ASIA },
  Copenhagen: { iata: 'CPH', countryCode: 'DK', region: Region.EUROPE },
  'Da Nang': { iata: 'DAD', countryCode: 'VN', region: Region.SOUTH_EAST_ASIA },
  Darwin: { iata: 'DRW', countryCode: 'AU', region: Region.SOUTHWEST_PACIFIC },
  Davao: { iata: 'DVO', countryCode: 'PH', region: Region.SOUTH_EAST_ASIA },
  Dhaka: { iata: 'DAC', countryCode: 'BD', region: Region.SOUTH_ASIA },
  Dili: { iata: 'DIL', countryCode: 'TL', region: Region.SOUTH_EAST_ASIA },
  Dubai: { iata: 'DXB', countryCode: 'AE', region: Region.MIDDLE_EAST_AND_AFRICA },
  Düsseldorf: { iata: 'DUS', countryCode: 'DE', region: Region.EUROPE },
  Frankfurt: { iata: 'FRA', countryCode: 'DE', region: Region.EUROPE },
  Fukuoka: { iata: 'FUK', countryCode: 'JP', region: Region.NORTH_ASIA },
  Fuzhou: { iata: 'FOC', countryCode: 'CN', region: Region.NORTH_ASIA },
  Guangzhou: { iata: 'CAN', countryCode: 'CN', region: Region.NORTH_ASIA },
  Guilin: { iata: 'KWL', countryCode: 'CN', region: Region.NORTH_ASIA },
  Hanoi: { iata: 'HAN', countryCode: 'VN', region: Region.SOUTH_EAST_ASIA },
  Hiroshima: { iata: 'HIJ', countryCode: 'JP', region: Region.NORTH_ASIA },
  'Ho Chi Minh City': { iata: 'SGN', countryCode: 'VN', region: Region.SOUTH_EAST_ASIA },
  'Hong Kong': { iata: 'HKG', countryCode: 'HK', region: Region.NORTH_ASIA },
  Houston: { iata: 'IAH', countryCode: 'US', region: Region.NORTH_AMERICA },
  Hyderabad: { iata: 'HYD', countryCode: 'IN', region: Region.SOUTH_ASIA },
  Istanbul: { iata: 'IST', countryCode: 'TR', region: Region.MIDDLE_EAST_AND_AFRICA },
  Jakarta: { iata: 'CGK', countryCode: 'ID', region: Region.SOUTH_EAST_ASIA },
  Johannesburg: { iata: 'JNB', countryCode: 'ZA', region: Region.MIDDLE_EAST_AND_AFRICA },
  Kalibo: { iata: 'KLO', countryCode: 'PH', region: Region.SOUTH_EAST_ASIA },
  Kathmandu: { iata: 'KTM', countryCode: 'NP', region: Region.SOUTH_ASIA },
  Kochi: { iata: 'COK', countryCode: 'IN', region: Region.SOUTH_ASIA },
  'Koh Samui': { iata: 'USM', countryCode: 'TH', region: Region.SOUTH_EAST_ASIA },
  Kolkata: { iata: 'CCU', countryCode: 'IN', region: Region.SOUTH_ASIA },
  'Kota Kinabalu': { iata: 'BKI', countryCode: 'ID', region: Region.SOUTH_EAST_ASIA },
  'Kuala Lumpur': { iata: 'KUL', countryCode: 'MY', region: Region.SOUTH_EAST_ASIA },
  Kuching: { iata: 'KCH', countryCode: 'MY', region: Region.SOUTH_EAST_ASIA },
  Kunming: { iata: 'KMG', countryCode: 'CN', region: Region.NORTH_ASIA },
  Langkawi: { iata: 'LGK', countryCode: 'MY', region: Region.SOUTH_EAST_ASIA },
  Lombok: { iata: 'LOP', countryCode: 'ID', region: Region.SOUTH_EAST_ASIA },
  London: { iata: 'LON', countryCode: 'UK', region: Region.EUROPE },
  'Los Angeles': { iata: 'LAX', countryCode: 'US', region: Region.NORTH_AMERICA },
  'Luang Prabang': { iata: 'LPQ', countryCode: 'LA', region: Region.SOUTH_EAST_ASIA },
  Malé: { iata: 'MLE', countryCode: 'MV', region: Region.SOUTH_ASIA },
  Makassar: { iata: 'UPG', countryCode: 'ID', region: Region.SOUTH_EAST_ASIA },
  Manado: { iata: 'MDC', countryCode: 'ID', region: Region.SOUTH_EAST_ASIA },
  Manchester: { iata: 'MAN', countryCode: 'UK', region: Region.EUROPE },
  Mandalay: { iata: 'MDL', countryCode: 'MM', region: Region.SOUTH_EAST_ASIA },
  Manila: { iata: 'MNL', countryCode: 'PH', region: Region.SOUTH_EAST_ASIA },
  Medan: { iata: 'KNO', countryCode: 'ID', region: Region.SOUTH_EAST_ASIA },
  Melbourne: { iata: 'MEL', countryCode: 'AU', region: Region.SOUTHWEST_PACIFIC },
  Milan: { iata: 'MXP', countryCode: 'IT', region: Region.EUROPE },
  Moscow: { iata: 'MOW', countryCode: 'RU', region: Region.EUROPE },
  Mumbai: { iata: 'BOM', countryCode: 'IN', region: Region.SOUTH_ASIA },
  Munich: { iata: 'MUC', countryCode: 'DE', region: Region.EUROPE },
  Nagoya: { iata: 'NGO', countryCode: 'JP', region: Region.NORTH_ASIA },
  Naha: { iata: 'OKA', countryCode: 'JP', region: Region.NORTH_ASIA },
  'New Delhi': { iata: 'DEL', countryCode: 'IN', region: Region.SOUTH_ASIA },
  'New York': { iata: 'NYC', countryCode: 'US', region: Region.NORTH_AMERICA },
  Osaka: { iata: 'KIX', countryCode: 'JP', region: Region.NORTH_ASIA },
  Paris: { iata: 'CDG', countryCode: 'FR', region: Region.EUROPE },
  Palembang: { iata: 'PLM', countryCode: 'ID', region: Region.SOUTH_EAST_ASIA },
  Penang: { iata: 'PEN', countryCode: 'MY', region: Region.SOUTH_EAST_ASIA },
  Pekanbaru: { iata: 'PKU', countryCode: 'ID', region: Region.SOUTH_EAST_ASIA },
  Perth: { iata: 'PER', countryCode: 'AU', region: Region.SOUTHWEST_PACIFIC },
  'Phnom Penh': { iata: 'PNH', countryCode: 'KH', region: Region.SOUTH_EAST_ASIA },
  Phuket: { iata: 'HKT', countryCode: 'TH', region: Region.SOUTH_EAST_ASIA },
  Rome: { iata: 'FCO', countryCode: 'IT', region: Region.EUROPE },
  'San Francisco': { iata: 'SFO', countryCode: 'US', region: Region.NORTH_AMERICA },
  Seattle: { iata: 'SEA', countryCode: 'US', region: Region.NORTH_AMERICA },
  Semarang: { iata: 'SRG', countryCode: 'ID', region: Region.SOUTH_EAST_ASIA },
  Seoul: { iata: 'ICN', countryCode: 'KR', region: Region.NORTH_ASIA },
  Shanghai: { iata: 'PVG', countryCode: 'CN', region: Region.NORTH_ASIA },
  Shenzhen: { iata: 'SZX', countryCode: 'CN', region: Region.NORTH_ASIA },
  'Siem Reap': { iata: 'SAI', countryCode: 'KH', region: Region.SOUTH_EAST_ASIA },
  Singapore: { iata: 'SIN', countryCode: 'SG', region: Region.SOUTH_EAST_ASIA },
  Surabaya: { iata: 'SUB', countryCode: 'ID', region: Region.SOUTH_EAST_ASIA },
  Sydney: { iata: 'SYD', countryCode: 'AU', region: Region.SOUTHWEST_PACIFIC },
  Taipei: { iata: 'TPE', countryCode: 'TW', region: Region.NORTH_ASIA },
  Tokyo: { iata: 'TYO', countryCode: 'JP', region: Region.NORTH_ASIA },
  Trivandrum: { iata: 'TRV', countryCode: 'IN', region: Region.SOUTH_ASIA },
  Vancouver: { iata: 'YVR', countryCode: 'CA', region: Region.NORTH_AMERICA },
  Vientiane: { iata: 'VTE', countryCode: 'LA', region: Region.SOUTH_EAST_ASIA },
  Visakhapatnam: { iata: 'VTZ', countryCode: 'IN', region: Region.SOUTH_ASIA },
  Wellington: { iata: 'WLG', countryCode: 'NZ', region: Region.SOUTHWEST_PACIFIC },
  Wuhan: { iata: 'WUH', countryCode: 'CN', region: Region.NORTH_ASIA },
  Xiamen: { iata: 'XMN', countryCode: 'CN', region: Region.NORTH_ASIA },
  Yangon: { iata: 'RGN', countryCode: 'MM', region: Region.SOUTH_EAST_ASIA },
  Yogyakarta: { iata: 'YIA', countryCode: 'ID', region: Region.SOUTH_EAST_ASIA },
  Zürich: { iata: 'ZRH', countryCode: 'CH', region: Region.EUROPE },
};

/**
 * Mapping from either:
 * - old airport IATAs to new airport IATAs
 * - specific airport IATAs to the collective city IATA, for cities that have multiple international airports
 *
 * Note: when adding a new mapping here, probably need to rerun `generate-oag-data` too,
 * to ensure that the OAG dataset is updated with the new IATA mappings.
 */
export const iataToIataMappings: Record<string, string> = {
  REP: 'SAI', // Siem Reap
  JOG: 'YIA', // Yogyakarta
  TFU: 'CTU', // Chengdu
  HND: 'TYO', // Tokyo
  NRT: 'TYO', // Tokyo
  JFK: 'NYC', // New York
  EWR: 'NYC', // New York
  DME: 'MOW', // Moscow
  SVO: 'MOW', // Moscow
  LHR: 'LON', // London
  LGW: 'LON', // London
};

export const iataMappings = Object.entries(cityMappings).reduce(
  (_iataMappings: Record<string, string>, [city, cityMapping]) => {
    _iataMappings[cityMapping.iata] = city;
    return _iataMappings;
  },
  {},
);
