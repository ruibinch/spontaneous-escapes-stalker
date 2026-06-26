'use client';

import { RouteAnalysisEntry, FlightClass } from '@/index';
import { CommonStyles } from '../common/styles';
import { Link } from '@heroui/react';

interface Props {
  routeAnalysisList: RouteAnalysisEntry[];
}

interface RouteLifecycleEntry {
  origin: string;
  originIata: string;
  destination: string;
  destinationIata: string;
  region: string;
  firstSeen: string;
  lastSeen: string;
  monthsAppeared: number;
  longestStreak: number;
}

export function RouteLifecycle({ routeAnalysisList }: Props) {
  const lifecycle = computeLifecycle(routeAnalysisList);

  // New routes (first appeared in last 18 months, roughly 202501+)
  const newRoutes = lifecycle
    .filter((r) => r.firstSeen >= '202501')
    .sort((a, b) => b.firstSeen.localeCompare(a.firstSeen));

  // Disappeared routes (last seen before 202501, appeared at least 3 times)
  const disappeared = lifecycle
    .filter((r) => r.lastSeen < '202501' && r.monthsAppeared >= 3)
    .sort((a, b) => b.lastSeen.localeCompare(a.lastSeen))
    .slice(0, 8);

  // Most consistent (highest frequency)
  const mostConsistent = [...lifecycle]
    .sort((a, b) => b.monthsAppeared - a.monthsAppeared)
    .slice(0, 8);

  // Longest streaks
  const longestStreaks = [...lifecycle]
    .sort((a, b) => b.longestStreak - a.longestStreak)
    .slice(0, 8);

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className={CommonStyles.SectionTitle}>Route Lifecycle</h2>
        <p className="text-sm text-text-secondary mt-0.5">
          How routes enter, persist, and exit the program
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* New Routes */}
        <div className="flex flex-col gap-3 p-4 rounded-lg border border-green-200 dark:border-green-900 bg-green-50/30 dark:bg-green-950/10">
          <span className="text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-green-400">
            Recently Added
          </span>
          {newRoutes.length === 0 ? (
            <p className="text-sm text-text-muted">
              No new routes added since Jan 2025.
            </p>
          ) : (
            <div className="space-y-2">
              {newRoutes.map((r) => (
                <RouteRow key={`${r.originIata}${r.destinationIata}`} route={r} showField="firstSeen" />
              ))}
            </div>
          )}
        </div>

        {/* Disappeared */}
        <div className="flex flex-col gap-3 p-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-950/10">
          <span className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-400">
            No Longer Offered
          </span>
          {disappeared.length === 0 ? (
            <p className="text-sm text-text-muted">
              No routes have been discontinued recently.
            </p>
          ) : (
            <div className="space-y-2">
              {disappeared.map((r) => (
                <RouteRow key={`${r.originIata}${r.destinationIata}`} route={r} showField="lastSeen" />
              ))}
            </div>
          )}
        </div>

        {/* Most Consistent */}
        <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-surface">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Most Consistent (by total appearances)
          </span>
          <div className="space-y-2">
            {mostConsistent.map((r) => (
              <div
                key={`${r.originIata}${r.destinationIata}`}
                className="flex items-center justify-between text-sm"
              >
                <Link
                  href={`/route/${r.originIata}${r.destinationIata}`}
                  className="text-sm text-accent hover:text-accent-hover"
                >
                  {r.origin} → {r.destination}
                </Link>
                <span className="text-text-muted text-xs">
                  {r.monthsAppeared} months
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Longest Streaks */}
        <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-surface">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Longest Consecutive Streaks
          </span>
          <div className="space-y-2">
            {longestStreaks.map((r) => (
              <div
                key={`${r.originIata}${r.destinationIata}`}
                className="flex items-center justify-between text-sm"
              >
                <Link
                  href={`/route/${r.originIata}${r.destinationIata}`}
                  className="text-sm text-accent hover:text-accent-hover"
                >
                  {r.origin} → {r.destination}
                </Link>
                <span className="text-text-muted text-xs">
                  {r.longestStreak} months in a row
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RouteRow({
  route,
  showField,
}: {
  route: RouteLifecycleEntry;
  showField: 'firstSeen' | 'lastSeen';
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <Link
        href={`/route/${route.originIata}${route.destinationIata}`}
        className="text-sm text-accent hover:text-accent-hover"
      >
        {route.origin} → {route.destination}
      </Link>
      <span className="text-text-muted text-xs">
        {showField === 'firstSeen' ? 'Since' : 'Last'}{' '}
        {formatMonthShort(route[showField])}
      </span>
    </div>
  );
}

function computeLifecycle(
  routeAnalysisList: RouteAnalysisEntry[],
): RouteLifecycleEntry[] {
  return routeAnalysisList
    .map((route) => {
      let firstSeen: string | null = null;
      let lastSeen: string | null = null;
      let monthsAppeared = 0;
      let longestStreak = 0;
      let currentStreak = 0;

      for (const detail of route.details) {
        const hasRedemption = (['Y', 'W', 'J'] as FlightClass[]).some(
          (c) => detail.redemptionDetails[c] !== null,
        );

        if (hasRedemption) {
          monthsAppeared++;
          if (!firstSeen) firstSeen = detail.month;
          lastSeen = detail.month;
          currentStreak++;
          longestStreak = Math.max(longestStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }

      if (!firstSeen || !lastSeen) return null;

      return {
        origin: route.origin,
        originIata: route.originIata,
        destination: route.destination,
        destinationIata: route.destinationIata,
        region: route.region,
        firstSeen,
        lastSeen,
        monthsAppeared,
        longestStreak,
      };
    })
    .filter((r): r is RouteLifecycleEntry => r !== null);
}

function formatMonthShort(month: string): string {
  const year = month.slice(0, 4);
  const monthNum = parseInt(month.slice(4, 6), 10);
  const names = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${names[monthNum - 1]} ${year}`;
}
