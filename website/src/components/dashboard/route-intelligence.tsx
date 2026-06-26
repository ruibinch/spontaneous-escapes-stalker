'use client';

import { RouteAnalysisEntry, FlightClass } from '@/index';
import { CommonStyles } from '@/components/common/styles';
import { SearchIcon } from '@/components/icons/search';
import { Link } from '@heroui/react';
import { useState, useMemo } from 'react';

interface Props {
  routeAnalysisList: RouteAnalysisEntry[];
  monthsList: string[];
}

interface RouteStats {
  route: RouteAnalysisEntry;
  frequency: number;
  monthsAppeared: number;
  totalMonths: number;
  lastSeen: string | null;
  classesAvailable: FlightClass[];
}

const flightClassLabels: Record<FlightClass, string> = {
  Y: 'Y',
  W: 'W',
  J: 'J',
};

export function RouteIntelligence({ routeAnalysisList, monthsList }: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  const routeStats = useMemo(
    () => computeRouteStats(routeAnalysisList, monthsList),
    [routeAnalysisList, monthsList],
  );

  const filteredRoutes = useMemo(() => {
    if (!searchTerm.trim()) return routeStats.slice(0, 8);

    const term = searchTerm.toLowerCase();
    return routeStats
      .filter(
        (r) =>
          r.route.origin.toLowerCase().includes(term) ||
          r.route.destination.toLowerCase().includes(term) ||
          r.route.originIata.toLowerCase().includes(term) ||
          r.route.destinationIata.toLowerCase().includes(term) ||
          r.route.originCountry.toLowerCase().includes(term) ||
          r.route.destinationCountry.toLowerCase().includes(term),
      )
      .slice(0, 12);
  }, [routeStats, searchTerm]);

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className={CommonStyles.SectionTitle}>Route Intelligence</h2>
        <p className="text-sm text-text-secondary mt-0.5">
          Search any route to see historical frequency and trends
        </p>
      </div>

      <div className="relative">
        <SearchIcon
          width={16}
          height={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by city, country, or IATA code..."
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
        />
      </div>

      <FlightClassLegendInline />

      {filteredRoutes.length === 0 ? (
        <div className="text-sm text-text-muted py-8 text-center">
          No routes found for &ldquo;{searchTerm}&rdquo;
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredRoutes.map((stats) => (
            <RouteCard
              key={`${stats.route.originIata}-${stats.route.destinationIata}`}
              stats={stats}
            />
          ))}
        </div>
      )}

      {!searchTerm && (
        <div className="text-center">
          <Link
            href="/route"
            className="text-sm text-accent hover:text-accent-hover"
          >
            View all {routeStats.length} routes →
          </Link>
        </div>
      )}
    </section>
  );
}

function RouteCard({ stats }: { stats: RouteStats }) {
  const routeSlug = `${stats.route.originIata}${stats.route.destinationIata}`;
  const frequencyColor = 'text-text-primary font-semibold';
  const barColor = 'bg-slate-400 dark:bg-slate-400';

  return (
    <Link href={`/route/${routeSlug}`} className="block">
      <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-surface hover:border-accent/30 hover:bg-accent-subtle/50 transition-colors cursor-pointer">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-medium text-text-primary">
              {stats.route.origin} → {stats.route.destination}
            </div>
          </div>
          <div className="flex gap-1">
            {stats.classesAvailable.map((c) => (
              <FlightClassBadge key={c} flightClass={c} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-text-muted">Frequency</span>
              <span className={`font-medium ${frequencyColor}`}>
                {stats.frequency}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-border">
              <div
                className={`h-full rounded-full ${barColor}`}
                style={{ width: `${Math.max(stats.frequency, 2)}%` }}
              />
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-text-muted">Last seen</div>
            <div className="font-medium text-text-primary">
              {stats.lastSeen ? formatMonthShort(stats.lastSeen) : '—'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function FlightClassBadge({ flightClass }: { flightClass: FlightClass }) {
  const styles: Record<FlightClass, string> = {
    Y: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    W: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
    J: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  };

  return (
    <span
      className={`text-2xs font-medium px-1.5 py-0.5 rounded ${styles[flightClass]}`}
    >
      {flightClassLabels[flightClass]}
    </span>
  );
}

function FlightClassLegendInline() {
  const items: Array<{ code: FlightClass; label: string; style: string }> = [
    { code: 'Y', label: 'Economy', style: 'bg-green-500' },
    { code: 'W', label: 'Premium Economy', style: 'bg-violet-500' },
    { code: 'J', label: 'Business', style: 'bg-blue-600' },
  ];

  return (
    <div className="flex gap-3 text-xs text-text-muted">
      {items.map((item) => (
        <div key={item.code} className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-sm ${item.style}`} />
          <span>
            <span className="font-medium text-text-secondary">{item.code}</span>{' '}
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function computeRouteStats(
  routeAnalysisList: RouteAnalysisEntry[],
  monthsList: string[],
): RouteStats[] {
  const totalMonths = monthsList.length;

  return routeAnalysisList
    .map((route) => {
      let monthsAppeared = 0;
      let lastSeen: string | null = null;
      const classesSet = new Set<FlightClass>();

      for (const detail of route.details) {
        const hasRedemption = (['Y', 'W', 'J'] as FlightClass[]).some(
          (c) => detail.redemptionDetails[c] !== null,
        );

        if (hasRedemption) {
          monthsAppeared++;
          lastSeen = detail.month;

          for (const c of ['Y', 'W', 'J'] as FlightClass[]) {
            if (detail.redemptionDetails[c]) {
              classesSet.add(c);
            }
          }
        }
      }

      if (monthsAppeared === 0) return null;

      return {
        route,
        frequency: Math.round((monthsAppeared / totalMonths) * 100),
        monthsAppeared,
        totalMonths,
        lastSeen,
        classesAvailable: (['Y', 'W', 'J'] as FlightClass[]).filter((c) =>
          classesSet.has(c),
        ),
      };
    })
    .filter((s): s is RouteStats => s !== null)
    .sort((a, b) => b.frequency - a.frequency);
}

function formatMonthShort(month: string): string {
  const year = month.slice(2, 4);
  const monthNum = parseInt(month.slice(4, 6), 10);
  const names = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${names[monthNum - 1]} '${year}`;
}
