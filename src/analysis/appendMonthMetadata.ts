import { MonthSummaryAnalysisEntry } from './generateMonthSummaryAnalysis';
import metadataJson from '../../data/metadata.json';

type Metadata = {
  remarks?: string[] | undefined;
};

type MonthSummaryAnalysisEntryWithMetadata = MonthSummaryAnalysisEntry & {
  metadata?: Metadata;
};

export function appendMonthMetadata(
  monthSummaryAnalysis: MonthSummaryAnalysisEntry[],
): MonthSummaryAnalysisEntryWithMetadata[] {
  return monthSummaryAnalysis.map((entry) => {
    const metadataEntryForMonth = metadataJson.find(
      (md) => md.month === entry.month,
    );
    const metadata = {
      remarks: metadataEntryForMonth?.remarks,
    };

    return {
      ...entry,
      metadata,
    };
  });
}
