'use client';

import {
  MonthSummaryAnalysisEntry,
  RouteAnalysisEntry,
  FlightClass,
} from '@/index';
import { Link } from '@heroui/react';
import { CommonStyles } from '@/components/common/styles';

interface Props {
  routeAnalysisList: RouteAnalysisEntry[];
  latestMonth: string;
  latestMonthSummary: MonthSummaryAnalysisEntry | undefined;
  latestRedemptionAt: Date;
  totalMonths: number;
}

interface HighlightCard {
  label: string;
  title: string;
  detail: string;
  accent: 'green' | 'amber' | 'blue' | 'purple';
}

export function LatestReleaseHighlights({
  routeAnalysisList,
  latestMonth,
  latestMonthSummary,
  latestRedemptionAt,
  totalMonths,
}: Props) {
  const formattedMonth = formatMonthLabel(latestMonth);
  const highlights = getHighlights(
    routeAnalysisList,
    latestMonth,
    totalMonths,
  );

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className={CommonStyles.SectionTitle}>
            Latest: {formattedMonth}
          </h2>
          <p className="text-sm text-text-secondary mt-0.5">
            {latestMonthSummary
              ? `${latestMonthSummary.byUniqueRoutes.availableForRedemption.total} routes · ${latestMonthSummary.count} redemptions`
              : ''}
            {' · '}
            <span className="text-text-muted">
              Updated{' '}
              {latestRedemptionAt.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </p>
        </div>
        <Link
          href={`/month/${latestMonth}`}
          className="text-sm text-accent hover:text-accent-hover"
        >
          View all {formattedMonth} deals →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {highlights.map((h) => (
          <HighlightCardComponent key={h.label} highlight={h} />
        ))}
      </div>
    </section>
  );
}

function HighlightCardComponent({ highlight }: { highlight: HighlightCard }) {
  const accentStyles = {
    green:
      'border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20',
    amber:
      'border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20',
    blue: 'border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20',
    purple:
      'border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20',
  };

  const labelStyles = {
    green: 'text-green-700 dark:text-green-400',
    amber: 'text-amber-700 dark:text-amber-400',
    blue: 'text-blue-700 dark:text-blue-400',
    purple: 'text-purple-700 dark:text-purple-400',
  };

  return (
    <div
      className={`flex flex-col gap-1.5 p-4 rounded-lg border ${accentStyles[highlight.accent]}`}
    >
      <span
        className={`text-2xs font-semibold uppercase tracking-wider ${labelStyles[highlight.accent]}`}
      >
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
  routeAnalysisList: RouteAnalysisEntry[],
  latestMonth: string,
  totalMonths: number,
): HighlightCard[] {
  const highlights: HighlightCard[] = [];

  // Collect routes with redemptions in the latest month
  const latestMonthRoutes: Array<{
    route: RouteAnalysisEntry;
    classes: FlightClass[];
    minMiles: number;
    minBlackout: number;
    monthsWithRedemptions: number;
  }> = [];

  for (const route of routeAnalysisList) {
    const latestDetail = route.details.find((d) => d.month === latestMonth);
    if (!latestDetail) continue;

    const classes = (['Y', 'W', 'J'] as FlightClass[]).filter(
      (c) => latestDetail.redemptionDetails[c] !== null,
    );
    if (classes.length === 0) continue;

    const milesValues = classes
      .map((c) => latestDetail.redemptionDetails[c]?.milesRequired ?? Infinity)
      .filter((m) => m < Infinity);
    const blackoutValues = classes.map(
      (c) => latestDetail.redemptionDetails[c]?.blackoutPct ?? 0,
    );

    const monthsWithRedemptions = route.details.filter((d) =>
      (['Y', 'W', 'J'] as FlightClass[]).some(
        (c) => d.redemptionDetails[c] !== null,
      ),
    ).length;

    latestMonthRoutes.push({
      route,
      classes,
      minMiles: Math.min(...milesValues),
      minBlackout: Math.min(...blackoutValues),
      monthsWithRedemptions,
    });
  }

  // 1. Best value (lowest miles)
  const cheapest = [...latestMonthRoutes].sort(
    (a, b) => a.minMiles - b.minMiles,
  )[0];
  if (cheapest) {
    highlights.push({
      label: 'Best Value',
      title: `${cheapest.route.origin} → ${cheapest.route.destination}`,
      detail: `From ${cheapest.minMiles.toLocaleString()} miles (${cheapest.classes.join('/')})`,
      accent: 'green',
    });
  }

  // 2. Rarest route (lowest frequency %, min 1 appearance)
  const rarest = [...latestMonthRoutes]
    .filter((r) => r.monthsWithRedemptions > 0)
    .sort(
      (a, b) => a.monthsWithRedemptions - b.monthsWithRedemptions,
    )[0];
  if (rarest) {
    const pct = Math.round((rarest.monthsWithRedemptions / totalMonths) * 100);
    highlights.push({
      label: 'Rare Route',
      title: `${rarest.route.origin} → ${rarest.route.destination}`,
      detail: `Only appeared in ${pct}% of months (${rarest.monthsWithRedemptions}/${totalMonths})`,
      accent: 'purple',
    });
  }

  // 3. Zero blackout highlight
  const zeroBlackoutRoutes = latestMonthRoutes.filter(
    (r) => r.minBlackout === 0,
  );
  if (zeroBlackoutRoutes.length > 0) {
    highlights.push({
      label: 'Full Availability',
      title: `${zeroBlackoutRoutes.length} routes with 0% blackout`,
      detail: `Includes ${zeroBlackoutRoutes
        .slice(0, 3)
        .map((r) => r.route.destination)
        .join(', ')}${zeroBlackoutRoutes.length > 3 ? ` + ${zeroBlackoutRoutes.length - 3} more` : ''}`,
      accent: 'blue',
    });
  }

  // 4. Most congested route (highest blackout)
  const mostCongested = [...latestMonthRoutes].sort(
    (a, b) => {
      const aMax = Math.max(
        ...a.classes.map(
          (c) =>
            a.route.details.find((d) => d.month === latestMonth)
              ?.redemptionDetails[c]?.blackoutPct ?? 0,
        ),
      );
      const bMax = Math.max(
        ...b.classes.map(
          (c) =>
            b.route.details.find((d) => d.month === latestMonth)
              ?.redemptionDetails[c]?.blackoutPct ?? 0,
        ),
      );
      return bMax - aMax;
    },
  )[0];
  if (mostCongested) {
    const maxBlackout = Math.max(
      ...mostCongested.classes.map(
        (c) =>
          mostCongested.route.details.find((d) => d.month === latestMonth)
            ?.redemptionDetails[c]?.blackoutPct ?? 0,
      ),
    );
    highlights.push({
      label: 'Most Congested',
      title: `${mostCongested.route.origin} → ${mostCongested.route.destination}`,
      detail: `${maxBlackout}% blackout — limited availability`,
      accent: 'amber',
    });
  }

  return highlights;
}

function formatMonthLabel(month: string): string {
  const year = month.slice(0, 4);
  const monthNum = parseInt(month.slice(4, 6), 10);
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${monthNames[monthNum - 1]} ${year}`;
}
