'use client';

import { FlightClass, RedemptionEntry, RouteAnalysisEntry } from '@/index';
import { useMemo } from 'react';

interface HighlightCard {
  label: string;
  title: string;
  detail: string;
  accent: 'green' | 'amber' | 'blue' | 'purple' | 'red';
}

interface Props {
  redemptions: RedemptionEntry[];
  routeAnalysisList: RouteAnalysisEntry[];
  totalMonths: number;
}

export function MonthHighlights({
  redemptions,
  routeAnalysisList,
  totalMonths,
}: Props) {
  const highlights = useMemo(
    () => getHighlights(redemptions, routeAnalysisList, totalMonths),
    [redemptions, routeAnalysisList, totalMonths],
  );

  if (highlights.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {highlights.map((h) => (
        <HighlightCardComponent key={h.label} highlight={h} />
      ))}
    </div>
  );
}

function HighlightCardComponent({ highlight }: { highlight: HighlightCard }) {
  const accentStyles: Record<string, { border: string; bg: string; label: string }> = {
    green: {
      border: 'border-green-200 dark:border-green-900',
      bg: 'bg-green-50/50 dark:bg-green-950/20',
      label: 'text-green-700 dark:text-green-400',
    },
    amber: {
      border: 'border-amber-200 dark:border-amber-900',
      bg: 'bg-amber-50/50 dark:bg-amber-950/20',
      label: 'text-amber-700 dark:text-amber-400',
    },
    blue: {
      border: 'border-blue-200 dark:border-blue-900',
      bg: 'bg-blue-50/50 dark:bg-blue-950/20',
      label: 'text-blue-700 dark:text-blue-400',
    },
    purple: {
      border: 'border-purple-200 dark:border-purple-900',
      bg: 'bg-purple-50/50 dark:bg-purple-950/20',
      label: 'text-purple-700 dark:text-purple-400',
    },
    red: {
      border: 'border-red-200 dark:border-red-900',
      bg: 'bg-red-50/50 dark:bg-red-950/20',
      label: 'text-red-700 dark:text-red-400',
    },
  };

  const s = accentStyles[highlight.accent];

  return (
    <div className={`flex flex-col gap-1.5 p-3 rounded-lg border ${s.border} ${s.bg}`}>
      <span className={`text-2xs font-semibold uppercase tracking-wider ${s.label}`}>
        {highlight.label}
      </span>
      <span className="text-sm font-medium text-text-primary">
        {highlight.title}
      </span>
      <span className="text-xs text-text-secondary">{highlight.detail}</span>
    </div>
  );
}

function getHighlights(
  redemptions: RedemptionEntry[],
  routeAnalysisList: RouteAnalysisEntry[],
  totalMonths: number,
): HighlightCard[] {
  if (redemptions.length === 0) return [];

  const highlights: HighlightCard[] = [];

  // Build a frequency map for all routes
  const routeFrequencyMap = new Map<string, number>();
  for (const route of routeAnalysisList) {
    const key = `${route.origin}→${route.destination}`;
    const monthsAppeared = route.details.filter((d) =>
      (['Y', 'W', 'J'] as FlightClass[]).some(
        (c) => d.redemptionDetails[c] !== null,
      ),
    ).length;
    routeFrequencyMap.set(key, monthsAppeared);
  }

  // Group redemptions by route
  const routeMap = new Map<
    string,
    { redemptions: RedemptionEntry[]; frequency: number }
  >();
  for (const r of redemptions) {
    const key = `${r.origin}→${r.destination}`;
    if (!routeMap.has(key)) {
      routeMap.set(key, {
        redemptions: [],
        frequency: routeFrequencyMap.get(key) ?? 0,
      });
    }
    routeMap.get(key)!.redemptions.push(r);
  }

  // 1. Rarest route (lowest frequency)
  const routeEntries: Array<[string, { redemptions: RedemptionEntry[]; frequency: number }]> = [];
  routeMap.forEach((v, k) => routeEntries.push([k, v]));
  const rarestEntry = routeEntries
    .filter(([, v]) => v.frequency > 0)
    .sort((a, b) => a[1].frequency - b[1].frequency)[0];
  if (rarestEntry) {
    const [routeName, { frequency }] = rarestEntry;
    const pct = Math.round((frequency / totalMonths) * 100);
    if (pct <= 25) {
      highlights.push({
        label: 'Rare Route',
        title: routeName,
        detail: `Only appeared in ${pct}% of months (${frequency}/${totalMonths})`,
        accent: 'purple',
      });
    }
  }

  // 2. Best value (lowest miles economy)
  const economyRedemptions = redemptions.filter(
    (r) => r.flightClass === 'Economy',
  );
  if (economyRedemptions.length > 0) {
    const cheapest = economyRedemptions.reduce((min, r) =>
      r.milesRequired < min.milesRequired ? r : min,
    );
    highlights.push({
      label: 'Cheapest Economy',
      title: `${cheapest.origin} → ${cheapest.destination}`,
      detail: `${cheapest.milesRequired.toLocaleString()} miles`,
      accent: 'green',
    });
  }

  // 3. Zero blackout routes count
  const zeroBlackoutRoutes = new Set<string>();
  for (const r of redemptions) {
    if (r.blackoutPct === 0) {
      zeroBlackoutRoutes.add(`${r.origin}→${r.destination}`);
    }
  }
  if (zeroBlackoutRoutes.size > 0) {
    const examples = Array.from(zeroBlackoutRoutes).slice(0, 3);
    highlights.push({
      label: 'Full Availability',
      title: `${zeroBlackoutRoutes.size} routes with 0% blackout`,
      detail: examples.join(', ') +
        (zeroBlackoutRoutes.size > 3
          ? ` + ${zeroBlackoutRoutes.size - 3} more`
          : ''),
      accent: 'blue',
    });
  }

  // 4. Worst blackout
  const worstBlackout = redemptions.reduce(
    (worst, r) => (r.blackoutPct > worst.blackoutPct ? r : worst),
    redemptions[0],
  );
  if (worstBlackout && worstBlackout.blackoutPct > 20) {
    highlights.push({
      label: 'Most Restricted',
      title: `${worstBlackout.origin} → ${worstBlackout.destination}`,
      detail: `${worstBlackout.blackoutPct}% blackout (${worstBlackout.flightClass})`,
      accent: 'red',
    });
  }

  return highlights.slice(0, 4);
}
