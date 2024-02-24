import { HelpCircleIcon } from '@/components/icons/help-circle';
import { RouteAnalysisEntry } from '@/index';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
} from '@nextui-org/react';
import routeAnalysisFile from '@/static/route-analysis.json';
import { roundToDp } from '@/common/round-to-dp';
import { TooltipDark } from '../common/tooltip-dark';
import { Dispatch, SetStateAction, useState } from 'react';
import {
  SearchTermFilter,
  isSearchTermMatch,
} from '../common/filters/search-term-filter';
import {
  TableRowsPerPage,
  useRowsPerPageHandler,
} from '../common/table/table-rows-per-page';
import { TablePagination } from '../common/table/table-pagination';

const routeAnalysisList = routeAnalysisFile as RouteAnalysisEntry[];

export function RouteRedeemablePctTable({
  showSilkairRoutes,
}: {
  showSilkairRoutes: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const data = routeAnalysisList
    .filter((entry) => {
      return isSearchTermMatch({
        searchTerm,
        strings: [entry.from, entry.fromIata, entry.to, entry.toIata],
      });
    })
    .map((entry) => {
      const details = excludeMonthsNotInOagDataset(entry.details);

      const numMonthsWithRedemption = details.filter((detail) => {
        return Object.values(detail.redemptionDetails).some(
          (redemptionInfo) => {
            if (showSilkairRoutes) return !!redemptionInfo;
            return redemptionInfo?.flightNos?.every((flightNo) =>
              flightNo.startsWith('SQ'),
            );
          },
        );
      }).length;
      const numMonthsWithFlight = details.filter((detail) => {
        const { sia, silkair } = detail.flightDetails ?? {};
        return showSilkairRoutes ? sia || silkair : sia;
      }).length;

      return {
        route: `${entry.from}-${entry.to}`,
        routeIata: `${entry.fromIata}-${entry.toIata}`,
        numMonthsWithRedemption,
        numMonthsWithFlight,
        redeemablePct: roundToDp(
          (numMonthsWithRedemption / numMonthsWithFlight) * 100,
          1,
        ),
      };
    })
    .filter(({ numMonthsWithFlight }) => numMonthsWithFlight > 0);

  // sort by percentage descending, then number of months with flight
  const dataSorted = [...data].sort((a, b) => {
    if (a.redeemablePct !== b.redeemablePct) {
      return b.redeemablePct - a.redeemablePct;
    }
    return b.numMonthsWithFlight - a.numMonthsWithFlight;
  });

  const {
    rowsPerPage,
    currPage,
    setCurrPage,
    pages,
    startIdx,
    endIdx,
    onRowsPerPageChange,
  } = useRowsPerPageHandler(dataSorted, false);

  return (
    <div className="flex flex-col gap-4 px-2 pt-2 pb-4 border border-neutral-250 rounded-md">
      <div className="flex gap-2">
        <span className="text-sm">{'Percentage of routes featured on SE'}</span>

        <TooltipDark
          content={
            'Flight class is not taken into account here, i.e. a route is considered featured on SE if at least one flight class is present in the month.'
          }
        >
          <div className="cursor-pointer">
            <HelpCircleIcon width={16} height={16} color="#404040" />
          </div>
        </TooltipDark>
      </div>

      <div className="grid grid-cols-3 items-center">
        <div className="col-span-2">
          <SearchTermFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            placeholder="Filter by city/IATA"
            useBasicDesign
          />
        </div>

        <div className="justify-self-end">
          <TableRowsPerPage
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={onRowsPerPageChange}
            label="Show:"
          />
        </div>
      </div>

      <RouteRedeemablePctTableContent
        data={dataSorted.slice(startIdx, endIdx)}
        currPage={currPage}
        setCurrPage={setCurrPage}
        pages={pages}
      />
    </div>
  );
}

const columns = [
  { key: 'route', label: 'Route' },
  { key: 'redeemablePct', label: 'Redeemable %', width: 150 },
];

function RouteRedeemablePctTableContent({
  data,
  pages,
  currPage,
  setCurrPage,
}: {
  data: Array<{
    route: string;
    routeIata: string;
    numMonthsWithRedemption: number;
    numMonthsWithFlight: number;
    redeemablePct: number;
  }>;
  pages: number;
  currPage: number;
  setCurrPage: Dispatch<SetStateAction<number>>;
}) {
  return (
    <Table
      radius="sm"
      aria-label="Percentage of redeemable routes table"
      removeWrapper
      bottomContent={
        <TablePagination
          pages={pages}
          page={currPage}
          setPage={setCurrPage}
          useBasicDesign
        />
      }
      bottomContentPlacement="outside"
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.key} width={column.width}>
            {(() => {
              switch (column.key) {
                case 'redeemablePct':
                  return (
                    <div className="flex gap-2">
                      <span>{column.label}</span>

                      <TooltipDark
                        content={
                          '# months with route featured on SE / # months with flight route'
                        }
                      >
                        <div className="cursor-pointer">
                          <HelpCircleIcon
                            width={16}
                            height={16}
                            color="#404040"
                          />
                        </div>
                      </TooltipDark>
                    </div>
                  );
                default:
                  return column.label;
              }
            })()}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={data}>
        {(item) => (
          <TableRow key={item.route} className="border-b">
            {(columnKey) => (
              <TableCell className="py-1.5">
                {(() => {
                  switch (columnKey) {
                    case 'redeemablePct':
                      return `${getKeyValue(item, columnKey)}% (${
                        item.numMonthsWithRedemption
                      }/${item.numMonthsWithFlight})`;
                    default:
                      return getKeyValue(item, columnKey);
                  }
                })()}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

/**
 * Months not part of the OAG dataset should be excluded to avoid skewing the comparison percentage.
 */
function excludeMonthsNotInOagDataset(details: RouteAnalysisEntry['details']) {
  return details.filter((detail) => !!detail.flightDetails);
}
