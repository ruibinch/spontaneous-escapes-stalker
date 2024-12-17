import metadataJson from '../../data/metadata.json';
import { MonthSummaryAnalysisEntry } from './generateMonthSummaryAnalysis';
import { RouteAnalysisEntry } from './generateRouteAnalysis';

type Metadata = {
  remarks?: string[] | undefined;
};

export function appendRouteMetadata(
  routeAnalysisEntryList: RouteAnalysisEntry[],
) {
  const byRouteMetadata = metadataJson.byRoute;

  const areArraysContainingSameElements = (arr1: string[], arr2: string[]) =>
    arr1.length === arr2.length && arr1.every((v) => arr2.includes(v));

  return routeAnalysisEntryList.map((entry) => {
    const metadataEntryForRoute = byRouteMetadata.find((md) =>
      areArraysContainingSameElements(md.cities, [
        entry.originIata,
        entry.destinationIata,
      ]),
    );
    const metadata: Metadata = {
      remarks: metadataEntryForRoute?.remarks,
    };

    return {
      ...entry,
      metadata,
    };
  });
}

export function appendMonthMetadata(
  monthSummaryAnalysis: MonthSummaryAnalysisEntry[],
) {
  const byMonthMetadata = metadataJson.byMonth;
  return monthSummaryAnalysis.map((entry) => {
    const metadataEntryForMonth = byMonthMetadata.find(
      (md) => md.month === entry.month,
    );
    const metadata: Metadata = {
      remarks: metadataEntryForMonth?.remarks,
    };

    return {
      ...entry,
      metadata,
    };
  });
}
