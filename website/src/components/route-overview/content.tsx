import { RouteAnalysisEntry } from '@/index';
import routeAnalysisFile from '@/static/route-analysis.json';
import { Link } from '@nextui-org/react';

const routeAnalysisList = routeAnalysisFile as RouteAnalysisEntry[];

export function RouteOverviewContent() {
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
    <div className="h-full lg:px-6 py-12 px-4">
      <div className="grid grid-cols-4 gap-4">
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
