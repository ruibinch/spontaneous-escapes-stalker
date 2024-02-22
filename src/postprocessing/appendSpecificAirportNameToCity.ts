import { RedemptionJson } from '../utils/types';

/**
 * Appends the airport name as a suffix to the city name, if the city has multiple airports
 * e.g. New York (JFK), New York (Newark), Tokyo (Haneda), Tokyo (Narita)
 *
 * The flight number is used to determine the airport.
 */
export function appendSpecificAirportNameToCity(
  redemptions: RedemptionJson[],
): RedemptionJson[] {
  return redemptions.map((redemption) => {
    const { origin, destination, flightNo } = redemption;
    const originWithAirportName = appendAirportName(origin, flightNo);
    const destinationWithAirportName = appendAirportName(destination, flightNo);

    return {
      ...redemption,
      ...(originWithAirportName ? { origin: originWithAirportName } : {}),
      ...(destinationWithAirportName
        ? { destination: destinationWithAirportName }
        : {}),
    };
  });
}

// TODO: handle Tokyo here
const cityToAirportMappings: Record<string, Record<string, string>> = {
  'New York': {
    SQ21: 'Newark',
    SQ22: 'Newark',
    SQ25: 'JFK',
    SQ26: 'JFK',
  },
};

function appendAirportName(city: string, flightNo: string) {
  if (!Object.keys(cityToAirportMappings).includes(city)) {
    return null;
  }

  const airportName = cityToAirportMappings?.[city][flightNo];
  if (!airportName) {
    throw new Error(
      `No airport name found for city=${city}/flightNo=${flightNo}`,
    );
  }

  return `${city} (${airportName})`;
}
