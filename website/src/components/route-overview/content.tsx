import { trackEvent } from '@/analytics';
import { RouteAnalysisEntry } from '@/index';
import { getRouteAnalysis } from '@/queries/getRouteAnalysis';
import { Link, Skeleton, cn } from '@nextui-org/react';
import { useQuery } from '@tanstack/react-query';
import { AlertApiError } from '../common/alert-api-error';
import { PageHeader } from '../common/page-header';
import { CommonStyles } from '../common/styles';

export function RouteOverview() {
  const {
    data: routeAnalysisList,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['route-analysis'],
    queryFn: getRouteAnalysis,
  });

  return (
    <div>
      <PageHeader
        title="View by Route"
        subtitle="View the history of Spontaneous Escapes redemptions offered for a specific route"
      />

      <div
        className={cn(
          CommonStyles.Page(),
          'grid grid-cols-3 md:grid-cols-4 gap-4',
        )}
      >
        {isLoading && (
          <>
            {new Array(9).fill(0).map((_, idx) => (
              <Skeleton key={idx} className="h-56 rounded-md" />
            ))}
          </>
        )}

        {isError && <AlertApiError refetch={refetch} />}

        {routeAnalysisList && (
          <RouteOverviewContent routeAnalysisList={routeAnalysisList} />
        )}
      </div>
    </div>
  );
}

function RouteOverviewContent({
  routeAnalysisList,
}: {
  routeAnalysisList: RouteAnalysisEntry[];
}) {
  const routeOverviewDict: Record<string, { label: string; href: string }[]> = {
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

  routeAnalysisList.forEach(({ from, fromIata, to, toIata }) => {
    const classificationLetter = (() => {
      const classificationCity = to === 'Singapore' ? from : to;
      return classificationCity[0];
    })();

    routeOverviewDict[classificationLetter].push({
      label: `${from}-${to}`,
      href: `/route/${fromIata}${toIata}`,
    });
  });

  const routeOverviewList = Object.entries(routeOverviewDict).map(
    ([letter, routes]) => ({
      letter,
      routes,
    }),
  );

  return (
    <>
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
    </>
  );
}
