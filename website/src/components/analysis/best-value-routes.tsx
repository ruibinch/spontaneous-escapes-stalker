'use client';

import { RouteAnalysisEntry, FlightClass } from '@/index';
import { CommonStyles } from '../common/styles';
import { Link } from '@heroui/react';
import { useMemo } from 'react';

interface Props {
  routeAnalysisList: RouteAnalysisEntry[];
}

interface RouteValue {
  origin: string;
  originIata: string;
  destination: string;
  destinationIata: string;
  region: string;
  frequency: number;
  avgBlackoutPct: number;
  avgMilesY: number | null;
  monthsAppeared: number;
  totalMonths: number;
}

export function BestValueRoutes({ routeAnalysisList }: Props) {
  const routes = useMemo(
    () => computeRouteValues(routeAnalysisList),
    [routeAnalysisList],
  );

  // Best availability: high frequency + low blackout
  const bestAvailability = [...routes]
    .filter((r) => r.monthsAppeared >= 10)
    .sort((a, b) => a.avgBlackoutPct - b.avgBlackoutPct)
    .slice(0, 6);

  // Cheapest routes (lowest avg economy miles)
  const cheapest = [...routes]
    .filter((r) => r.avgMilesY !== null && r.monthsAppeared >= 5)
    .sort((a, b) => (a.avgMilesY ?? Infinity) - (b.avgMilesY ?? Infinity))
    .slice(0, 6);

  // Most reliable (highest frequency)
  const mostReliable = [...routes]
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 6);

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className={CommonStyles.SectionTitle}>Route Value Guide</h2>
        <p className="text-sm text-text-secondary mt-0.5">
          Routes ranked by availability, cost, and reliability to help plan
          future redemptions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ValueList
          title="Best Availability"
          subtitle="Low blackout %, frequent appearances"
          routes={bestAvailability}
          metric={(r) => `${r.avgBlackoutPct.toFixed(1)}% avg blackout`}
        />
        <ValueList
          title="Lowest Miles (Economy)"
          subtitle="Cheapest redemptions on average"
          routes={cheapest}
          metric={(r) =>
            r.avgMilesY ? `${r.avgMilesY.toLocaleString()} avg miles` : '—'
          }
        />
        <ValueList
          title="Most Reliable"
          subtitle="Appear in the most months"
          routes={mostReliable}
          metric={(r) =>
            `${r.frequency}% (${r.monthsAppeared}/${r.totalMonths})`
          }
        />
      </div>
    </section>
  );
}

function ValueList({
  title,
  subtitle,
  routes,
  metric,
}: {
  title: string;
  subtitle: string;
  routes: RouteValue[];
  metric: (r: RouteValue) => string;
}) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-surface">
      <div>
        <span className="text-sm font-medium text-text-primary">{title}</span>
        <p className="text-xs text-text-muted">{subtitle}</p>
      </div>

      <div className="space-y-2.5">
        {routes.map((r, i) => (
          <div
            key={`${r.originIata}${r.destinationIata}`}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-text-muted w-4 shrink-0">
                {i + 1}.
              </span>
              <Link
                href={`/route/${r.originIata}${r.destinationIata}`}
                className="text-sm text-accent hover:text-accent-hover truncate"
              >
                {r.origin} → {r.destination}
              </Link>
            </div>
            <span className="text-xs text-text-muted shrink-0 ml-2">
              {metric(r)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function computeRouteValues(
  routeAnalysisList: RouteAnalysisEntry[],
): RouteValue[] {
  const totalMonths = routeAnalysisList[0]?.details.length ?? 0;

  return routeAnalysisList
    .map((route) => {
      let monthsAppeared = 0;
      let blackoutSum = 0;
      let blackoutCount = 0;
      let milesYSum = 0;
      let milesYCount = 0;

      for (const detail of route.details) {
        const classes = (['Y', 'W', 'J'] as FlightClass[]).filter(
          (c) => detail.redemptionDetails[c] !== null,
        );

        if (classes.length > 0) {
          monthsAppeared++;

          for (const c of classes) {
            const rd = detail.redemptionDetails[c]!;
            blackoutSum += rd.blackoutPct;
            blackoutCount++;
            if (c === 'Y') {
              milesYSum += rd.milesRequired;
              milesYCount++;
            }
          }
        }
      }

      if (monthsAppeared === 0) return null;

      return {
        origin: route.origin,
        originIata: route.originIata,
        destination: route.destination,
        destinationIata: route.destinationIata,
        region: route.region,
        frequency: Math.round((monthsAppeared / totalMonths) * 100),
        avgBlackoutPct:
          blackoutCount > 0
            ? Math.round((blackoutSum / blackoutCount) * 10) / 10
            : 0,
        avgMilesY:
          milesYCount > 0 ? Math.round(milesYSum / milesYCount) : null,
        monthsAppeared,
        totalMonths,
      };
    })
    .filter((r): r is RouteValue => r !== null);
}
