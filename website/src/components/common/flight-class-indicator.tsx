export function FlightClassIndicator({
  flightClass,
  flightClassCode,
}: {
  flightClass?: string;
  flightClassCode?: string;
}) {
  const color = getFlightClassIndicatorColor({
    flightClass,
    flightClassCode,
  });

  return color ? <div className={`w-2 h-2 rounded-lg ${color}`} /> : null;
}

export function getFlightClassIndicatorColor({
  flightClass,
  flightClassCode,
}: {
  flightClass?: string;
  flightClassCode?: string;
}) {
  if (flightClass === 'Economy' || flightClassCode === 'Y') {
    return 'bg-green-600';
  }
  if (flightClass === 'Premium Economy' || flightClassCode === 'W') {
    return 'bg-blue-600';
  }
  if (flightClass === 'Business' || flightClassCode === 'J') {
    return 'bg-red-700';
  }
  return '';
}
