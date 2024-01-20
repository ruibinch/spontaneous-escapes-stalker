/**
 * Handles the sorting logic for an array of routes, where each route is in the format `{origin}-{destination}`.
 *
 * Output is sorted by the following sections, with each subsection sorted in alphabetical order:
 *   1. SG outbound flights
 *   2. SG inbound flights
 *   3. all other flights
 */
export function sortRoutesList(routes: string[]) {
  return [...routes].sort((a, b) => {
    const [aOrigin, aDestination] = a.split('-');
    const [bOrigin, bDestination] = b.split('-');

    // SG outbound flights
    if (aOrigin === 'Singapore') {
      if (bOrigin === 'Singapore') {
        return aDestination.localeCompare(bDestination);
      }
      return -1; // b is not an SG outbound flight, so a less than b
    }
    if (bOrigin === 'Singapore') {
      return 1; // a is not an SG outbound flight, so b less than a
    }
    // SG inbound flights
    if (aDestination === 'Singapore') {
      if (bDestination === 'Singapore') {
        return aOrigin.localeCompare(bOrigin);
      }
      return -1; // b is not an SG inbound flight, so a less than b
    }
    if (bDestination === 'Singapore') {
      return 1; // a is not an SG inbound flight, so b less than a
    }

    // non-SG inbound/outbound flights
    return aOrigin !== bOrigin
      ? aOrigin.localeCompare(bOrigin)
      : aDestination.localeCompare(bDestination);
  });
}
