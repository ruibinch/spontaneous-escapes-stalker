'use client';
import { trackEvent } from '@/analytics';
import { useSilkairRoutesToggleContext } from '@/contexts/silkair-routes-toggle-context';
import { RouteAnalysisEntry } from '@/index';
import { Link, cn } from '@nextui-org/react';
import { PageHeader } from '../common/page-header';
import { SilkairRoutesToggle } from '../common/silkair-routes-toggle';
import { CommonStyles } from '../common/styles';

type RouteOverviewDict = Record<string, { label: string; href: string }[]>;

export function RouteOverviewContent({
  routeAnalysisListFull,
  routeAnalysisListSiaOnly,
}: {
  routeAnalysisListFull: RouteAnalysisEntry[];
  routeAnalysisListSiaOnly: RouteAnalysisEntry[];
}) {
  const { showSilkairRoutes } = useSilkairRoutesToggleContext();
  const routeAnalysisList = showSilkairRoutes
    ? routeAnalysisListFull
    : routeAnalysisListSiaOnly;

  const routeOverviewDict = routeAnalysisList.reduce(
    (
      _routeOverviewDict: RouteOverviewDict,
      { origin, originIata, destination, destinationIata },
    ) => {
      const classificationLetter = (() => {
        const classificationCity =
          destination === 'Singapore' ? origin : destination;
        return classificationCity[0];
      })();

      _routeOverviewDict[classificationLetter].push({
        label: `${origin}-${destination}`,
        href: `/route/${originIata}${destinationIata}`,
      });
      return _routeOverviewDict;
    },
    getInitialRouteOverviewDict(),
  );

  const routeOverviewList = Object.entries(routeOverviewDict).map(
    ([letter, routes]) => ({
      letter,
      routes,
    }),
  );

  return (
    <div>
      <PageHeader
        title="View by Route"
        subtitle="View the history of Spontaneous Escapes redemptions offered for a specific route"
        rightComponent={<SilkairRoutesToggle />}
      />

      <div
        className={cn(
          CommonStyles.Page(),
          'grid grid-cols-3 md:grid-cols-4 gap-4',
        )}
      >
        {routeOverviewList.map(({ letter, routes }) => (
          <div key={letter} className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">{letter}</h1>

            <div className="flex flex-col gap-1">
              {routes.map((route) => (
                <Link
                  key={route.label}
                  href={route.href}
                  size="sm"
                  underline="hover"
                  onClick={() => {
                    trackEvent(['routeOverview'], { route: route.label });
                  }}
                  className="text-blue-500 dark:text-blue-400"
                >
                  {route.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getInitialRouteOverviewDict(): RouteOverviewDict {
  return {
    A: [],
    B: [],
    C: [],
    D: [],
    E: [],
    F: [],
    G: [],
    H: [],
    I: [],
    J: [],
    K: [],
    L: [],
    M: [],
    N: [],
    O: [],
    P: [],
    Q: [],
    R: [],
    S: [],
    T: [],
    U: [],
    V: [],
    W: [],
    X: [],
    Y: [],
    Z: [],
  };
}
