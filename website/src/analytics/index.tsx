const NEXT_PUBLIC_VERCEL_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV as
  | 'production'
  | 'preview'
  | 'development';

const isAnalyticsEnabled = NEXT_PUBLIC_VERCEL_ENV === 'production';

export function AnalyticsScript() {
  if (!isAnalyticsEnabled) {
    return null;
  }

  return (
    <script
      defer
      src="https://umami-production-bb5d.up.railway.app/script.js"
      data-website-id="72c90a3b-768b-4f5e-af4e-87b45cb0d3ce"
    ></script>
  );
}

export function trackEvent(
  eventNameInput: string[],
  data?: Record<string, string | number | boolean | null>,
) {
  if (!isAnalyticsEnabled) {
    return;
  }

  const eventName = eventNameInput.map(camelCase).join(':');
  // @ts-expect-error window.umami is defined
  window.umami?.track(eventName, data);
}

function camelCase(str: string) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if (+match === 0) return ''; // or if (/\s+/.test(match)) for white spaces
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}
