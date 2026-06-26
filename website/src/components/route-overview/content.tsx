'use client';
import { trackEvent } from '@/analytics';
import { useSilkairRoutesToggleContext } from '@/contexts/silkair-routes-toggle-context';
import { FlightClass, Region, RouteAnalysisEntry } from '@/index';
import { Link, cn } from '@heroui/react';
import { useCallback, useMemo, useState } from 'react';
import { SearchIcon } from '../icons/search';
import { PageHeader } from '../common/page-header';
import { CommonStyles } from '../common/styles';

interface RouteCardData {
  route: RouteAnalysisEntry;
  href: string;
  label: string;
  frequency: number;
  monthsAppeared: number;
  totalMonths: number;
  lastSeen: string | null;
  avgMilesY: number | null;
  classesAvailable: FlightClass[];
  region: string;
}

type SortOption = 'frequency' | 'name' | 'miles';

export function RouteOverviewContent({
  routeAnalysisListFull,
  routeAnalysisListSiaOnly,
}: {
  routeAnalysisListFull: RouteAnalysisEntry[];
  routeAnalysisListSiaOnly: RouteAnalysisEntry[];
}) {
  const { showSilkairRoutes } = useSilkairRoutesToggleContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('frequency');

  const routeAnalysisList = showSilkairRoutes
    ? routeAnalysisListFull
    : routeAnalysisListSiaOnly;

  const routeCards = useMemo(
    () => computeRouteCards(routeAnalysisList),
    [routeAnalysisList],
  );

  const regions = useMemo(() => {
    const regionSet = new Set(routeCards.map((r) => r.region));
    return ['All', ...Array.from(regionSet).sort()];
  }, [routeCards]);

  const filteredRoutes = useMemo(() => {
    let result = routeCards;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.route.origin.toLowerCase().includes(term) ||
          r.route.destination.toLowerCase().includes(term) ||
          r.route.originIata.toLowerCase().includes(term) ||
          r.route.destinationIata.toLowerCase().includes(term) ||
          r.route.originCountry.toLowerCase().includes(term) ||
          r.route.destinationCountry.toLowerCase().includes(term),
      );
    }

    if (selectedRegion !== 'All') {
      result = result.filter((r) => r.region === selectedRegion);
    }

    if (sortBy === 'frequency') {
      result = [...result].sort((a, b) => b.frequency - a.frequency);
    } else if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.label.localeCompare(b.label));
    } else if (sortBy === 'miles') {
      result = [...result].sort((a, b) => {
        const aM = a.avgMilesY ?? Infinity;
        const bM = b.avgMilesY ?? Infinity;
        return aM - bM;
      });
    }

    return result;
  }, [routeCards, searchTerm, selectedRegion, sortBy]);

  return (
    <div className={CommonStyles.Page()}>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Route Explorer"
          subtitle={`${routeCards.length} routes tracked across ${routeCards[0]?.totalMonths ?? 0} monthly releases`}
        />

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
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

          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          >
            {regions.map((r) => (
              <option key={r} value={r}>
                {r === 'All' ? 'All Regions' : r}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2.5 text-sm rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          >
            <option value="frequency">Sort: Frequency</option>
            <option value="name">Sort: Name</option>
            <option value="miles">Sort: Miles (low)</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-text-muted">
            Showing {filteredRoutes.length} of {routeCards.length} routes
          </div>
          <div className="flex gap-3 text-xs text-text-muted">
            {([
              { code: 'Y', label: 'Economy', style: 'bg-green-500' },
              { code: 'W', label: 'Premium Economy', style: 'bg-violet-500' },
              { code: 'J', label: 'Business', style: 'bg-blue-600' },
            ] as const).map((item) => (
              <div key={item.code} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-sm ${item.style}`} />
                <span>
                  <span className="font-medium text-text-secondary">{item.code}</span>{' '}
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Route cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredRoutes.map((data) => (
            <RouteCard key={data.href} data={data} />
          ))}
        </div>

        {filteredRoutes.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            No routes found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}

function RouteCard({ data }: { data: RouteCardData }) {
  const frequencyColor = 'text-text-primary font-semibold';
  const barColor = 'bg-slate-400 dark:bg-slate-400';

  const classStyles: Record<FlightClass, string> = {
    Y: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    W: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
    J: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  };

  const classLabels: Record<FlightClass, string> = {
    Y: 'Y',
    W: 'W',
    J: 'J',
  };

  return (
    <Link
      href={data.href}
      className="block"
      onClick={() => {
        trackEvent(['routeExplorer'], { route: data.label });
      }}
    >
      <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-surface hover:border-accent/30 hover:bg-accent-subtle/50 transition-colors cursor-pointer h-full">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-sm font-medium text-text-primary truncate">
              {data.route.origin} → {data.route.destination}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            {data.classesAvailable.map((c) => (
              <span
                key={c}
                className={`text-2xs font-medium px-1.5 py-0.5 rounded ${classStyles[c]}`}
              >
                {classLabels[c]}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-text-muted">Frequency</span>
              <span className={`font-medium ${frequencyColor}`}>
                {data.frequency}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-border">
              <div
                className={`h-full rounded-full ${barColor}`}
                style={{ width: `${Math.max(data.frequency, 2)}%` }}
              />
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-text-muted">Last seen</div>
            <div className="font-medium text-text-primary">
              {data.lastSeen ? formatMonthShort(data.lastSeen) : '—'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function computeRouteCards(
  routeAnalysisList: RouteAnalysisEntry[],
): RouteCardData[] {
  const totalMonths = routeAnalysisList[0]?.details.length ?? 0;

  return routeAnalysisList
    .map((route) => {
      let monthsAppeared = 0;
      let lastSeen: string | null = null;
      const classesSet = new Set<FlightClass>();
      let milesYSum = 0;
      let milesYCount = 0;

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
              if (c === 'Y') {
                milesYSum += detail.redemptionDetails[c]!.milesRequired;
                milesYCount++;
              }
            }
          }
        }
      }

      if (monthsAppeared === 0) return null;

      const destination =
        route.destination === 'Singapore' ? route.origin : route.destination;

      return {
        route,
        href: `/route/${route.originIata}${route.destinationIata}`,
        label: `${route.origin}-${route.destination}`,
        frequency: Math.round((monthsAppeared / totalMonths) * 100),
        monthsAppeared,
        totalMonths,
        lastSeen,
        avgMilesY: milesYCount > 0 ? Math.round(milesYSum / milesYCount) : null,
        classesAvailable: (['Y', 'W', 'J'] as FlightClass[]).filter((c) =>
          classesSet.has(c),
        ),
        region: route.region,
      };
    })
    .filter((r): r is RouteCardData => r !== null)
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
