export function trackEvent(
  eventNameInput: string[],
  data?: Record<string, string | number | boolean | null>,
) {
  const eventName = eventNameInput.map(camelCase).join(':');
  // @ts-expect-error window.umami is defined
  window.umami.track(eventName, data);
}

function camelCase(str: string) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if (+match === 0) return ''; // or if (/\s+/.test(match)) for white spaces
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}
