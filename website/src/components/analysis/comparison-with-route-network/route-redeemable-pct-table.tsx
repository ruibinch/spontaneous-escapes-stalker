import { roundToDp } from '@/common/round-to-dp';
import { useSilkairRoutesToggleContext } from '@/contexts/silkair-routes-toggle-context';
import { RouteAnalysisEntry } from '@/index';
import { Link } from '@heroui/react';
import { useState, useMemo } from 'react';
import { SearchIcon } from '../../icons/search';

interface RouteData {
  route: string;
  routeIata: string;
  origin: string;
  originIata: string;
  destination: string;
  destinationIata: string;
  numMonthsWithRedemption: number;
  numMonthsWithFlight: number;
  redeemablePct: number;
}

const TIERS = [
  { label: '60%+', min: 60, max: 101, color: 'bg-green-500 dark:bg-green-400' },
  { label: '40–60%', min: 40, max: 60, color: 'bg-blue-500 dark:bg-blue-400' },
  { label: '20–40%', min: 20, max: 40, color: 'bg-amber-500 dark:bg-amber-400' },
  { label: '<20%', min: 0, max: 20, color: 'bg-red-400 dark:bg-red-400' },
];

export function RouteRedeemablePctTable({
  routeAnalysisList,
}: {
  routeAnalysisList: RouteAnalysisEntry[];
}) {
  const { showSilkairRoutes } = useSilkairRoutesToggleContext();
  const [searchTerm, setSearchTerm] = useState('');

  const data = useMemo(() => {
    return routeAnalysisList
      .map((entry) => {
        const details = entry.details.filter((d) => !!d.oagData);

        const numMonthsWithRedemption = details.filter((detail) =>
          Object.values(detail.redemptionDetails).some((r) => !!r),
        ).length;
        const numMonthsWithFlight = details.filter((detail) => {
          const { hasSiaFlights, hasSilkairFlights } = detail.oagData ?? {};
          return showSilkairRoutes
            ? hasSiaFlights || hasSilkairFlights
            : hasSiaFlights;
        }).length;

        if (numMonthsWithFlight === 0) return null;

        return {
          route: `${entry.origin} → ${entry.destination}`,
          routeIata: `${entry.originIata}${entry.destinationIata}`,
          origin: entry.origin,
          originIata: entry.originIata,
          destination: entry.destination,
          destinationIata: entry.destinationIata,
          numMonthsWithRedemption,
          numMonthsWithFlight,
          redeemablePct: roundToDp(
            (numMonthsWithRedemption / numMonthsWithFlight) * 100,
            1,
          ),
        };
      })
      .filter((r): r is RouteData => r !== null)
      .sort((a, b) => {
        if (a.redeemablePct !== b.redeemablePct)
          return b.redeemablePct - a.redeemablePct;
        return b.numMonthsWithFlight - a.numMonthsWithFlight;
      });
  }, [routeAnalysisList, showSilkairRoutes]);

  // Tier distribution
  const tierCounts = TIERS.map((tier) => ({
    ...tier,
    count: data.filter(
      (r) => r.redeemablePct >= tier.min && r.redeemablePct < tier.max,
    ).length,
  }));
  const totalRoutes = data.length;

  // Top and bottom 5
  const topCoverage = data.slice(0, 5);
  const bottomCoverage = [...data]
    .filter((r) => r.redeemablePct > 0)
    .sort((a, b) => a.redeemablePct - b.redeemablePct)
    .slice(0, 5);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return null;
    const term = searchTerm.toLowerCase();
    return data
      .filter(
        (r) =>
          r.origin.toLowerCase().includes(term) ||
          r.destination.toLowerCase().includes(term) ||
          r.originIata.toLowerCase().includes(term) ||
          r.destinationIata.toLowerCase().includes(term),
      )
      .slice(0, 8);
  }, [data, searchTerm]);

  return (
    <div className="flex flex-col gap-5 p-5 rounded-lg border border-border bg-surface">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="text-sm font-medium text-text-primary">
            SE Coverage Distribution
          </span>
          <p className="text-xs text-text-muted mt-0.5">
            % of months each route appeared on SE relative to months it had
            scheduled flights ({totalRoutes} routes)
          </p>
        </div>

        {/* Route lookup */}
        <div className="relative w-full sm:w-64">
          <SearchIcon
            width={14}
            height={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Look up a route..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
        </div>
      </div>

      {/* Search results (shown when searching) */}
      {searchResults && (
        <div className="border border-border rounded-lg p-3">
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1.5">
              {searchResults.map((r) => (
                <div
                  key={r.routeIata}
                  className="flex items-center justify-between text-sm"
                >
                  <Link
                    href={`/route/${r.routeIata}`}
                    className="text-sm text-accent hover:text-accent-hover"
                  >
                    {r.route}
                  </Link>
                  <span className="text-xs text-text-secondary ml-2">
                    {r.redeemablePct}%{' '}
                    <span className="text-text-muted">
                      ({r.numMonthsWithRedemption}/{r.numMonthsWithFlight})
                    </span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted">No routes found.</p>
          )}
        </div>
      )}

      {/* Distribution bar */}
      <div className="flex flex-col gap-2">
        <div className="flex h-8 rounded-lg overflow-hidden">
          {tierCounts.map((tier) => {
            const pct = (tier.count / totalRoutes) * 100;
            if (pct === 0) return null;
            return (
              <div
                key={tier.label}
                className={`${tier.color} flex items-center justify-center`}
                style={{ width: `${pct}%` }}
              >
                {pct >= 8 && (
                  <span className="text-xs font-semibold text-white">
                    {tier.count}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {tierCounts.map((tier) => (
            <div key={tier.label} className="flex items-center gap-1.5 text-xs">
              <div className={`w-2.5 h-2.5 rounded-sm ${tier.color}`} />
              <span className="text-text-muted">
                {tier.label}:{' '}
                <span className="text-text-secondary font-medium">
                  {tier.count} routes
                </span>{' '}
                ({((tier.count / totalRoutes) * 100).toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top / Bottom highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 p-3 rounded-lg border border-green-200 dark:border-green-900 bg-green-50/30 dark:bg-green-950/10">
          <span className="text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-green-400">
            Highest SE coverage
          </span>
          <div className="space-y-1.5">
            {topCoverage.map((r) => (
              <div
                key={r.routeIata}
                className="flex items-center justify-between text-sm"
              >
                <Link
                  href={`/route/${r.routeIata}`}
                  className="text-sm text-accent hover:text-accent-hover"
                >
                  {r.route}
                </Link>
                <span className="text-xs text-text-muted ml-2">
                  {r.redeemablePct}% ({r.numMonthsWithRedemption}/
                  {r.numMonthsWithFlight})
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 p-3 rounded-lg border border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-950/10">
          <span className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-400">
            Lowest SE coverage
          </span>
          <div className="space-y-1.5">
            {bottomCoverage.map((r) => (
              <div
                key={r.routeIata}
                className="flex items-center justify-between text-sm"
              >
                <Link
                  href={`/route/${r.routeIata}`}
                  className="text-sm text-accent hover:text-accent-hover"
                >
                  {r.route}
                </Link>
                <span className="text-xs text-text-muted ml-2">
                  {r.redeemablePct}% ({r.numMonthsWithRedemption}/
                  {r.numMonthsWithFlight})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
