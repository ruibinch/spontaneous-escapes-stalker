export function FlightClassIndicator({
  flightClass,
}: {
  flightClass: string | undefined;
}) {
  const color = (() => {
    switch (flightClass) {
      case 'Y':
        return 'bg-green-600';
      case 'PY':
        return 'bg-blue-600';
      case 'J':
        return 'bg-red-700';
      default:
        return '';
    }
  })();

  return color ? <div className={`w-2 h-2 rounded-lg ${color}`} /> : null;
}
