import { roundToDp } from '@/common/round-to-dp';
import { HelpCircleIcon } from '@/components/icons/help-circle';
import { useSilkairRoutesToggleContext } from '@/contexts/silkair-routes-toggle-context';
import { RouteAnalysisEntry } from '@/index';
import {
  Link,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  cn,
  getKeyValue,
} from '@nextui-org/react';
import { Dispatch, SetStateAction, useState } from 'react';
import {
  SearchTermFilter,
  isSearchTermMatch,
} from '../../common/filters/search-term-filter';
import { CommonStyles } from '../../common/styles';
import { TablePagination } from '../../common/table/table-pagination';
import {
  TableRowsPerPage,
  useRowsPerPageHandler,
} from '../../common/table/table-rows-per-page';
import { TooltipOrPopover } from '../../common/tooltip-or-popover';
import { CardWrapper } from '@/components/common/card-wrapper';

export function RouteRedeemablePctTable({
  routeAnalysisList,
}: {
  routeAnalysisList: RouteAnalysisEntry[];
}) {
  const { showSilkairRoutes } = useSilkairRoutesToggleContext();
  const [searchTerm, setSearchTerm] = useState('');

  const data = routeAnalysisList
    .filter((entry) => {
      return isSearchTermMatch({
        searchTerm,
        strings: [
          entry.origin,
          entry.originIata,
          entry.destination,
          entry.destinationIata,
        ],
      });
    })
    .map((entry) => {
      const details = excludeMonthsNotInOagDataset(entry.details);

      const numMonthsWithRedemption = details.filter((detail) => {
        return Object.values(detail.redemptionDetails).some(
          (redemptionInfo) => !!redemptionInfo,
        );
      }).length;
      const numMonthsWithFlight = details.filter((detail) => {
        const { hasSiaFlights, hasSilkairFlights } = detail.oagData ?? {};
        return showSilkairRoutes
          ? hasSiaFlights || hasSilkairFlights
          : hasSiaFlights;
      }).length;

      return {
        route: `${entry.origin} - ${entry.destination}`,
        routeIata: `${entry.originIata}${entry.destinationIata}`,
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
    <CardWrapper
      title="Percentage of routes featured on SE"
      tooltip="Flight class is not taken into account here, i.e. a route is considered featured on SE if at least one flight class is present in the month."
      style="gap-4 pb-4"
      contentStyle="flex-col"
      content={
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 items-center">
            <div className="col-span-2">
              <SearchTermFilter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                placeholder="Filter by city / IATA"
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
      }
    />
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

                      <TooltipOrPopover
                        content={
                          '# months with route featured on SE / # months with flight route'
                        }
                      >
                        <div className="cursor-pointer">
                          <HelpCircleIcon width={16} height={16} />
                        </div>
                      </TooltipOrPopover>
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
          <TableRow
            key={item.route}
            className={cn(CommonStyles.Border, 'border-b')}
          >
            {(columnKey) => (
              <TableCell className="py-1.5 text-xs">
                {(() => {
                  switch (columnKey) {
                    case 'route':
                      return (
                        <Link
                          key={item.routeIata}
                          href={`/route/${item.routeIata}`}
                          size="sm"
                          underline="hover"
                          className={CommonStyles.Link}
                        >
                          {getKeyValue(item, columnKey)}
                        </Link>
                      );
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
  return details.filter((detail) => !!detail.oagData);
}
