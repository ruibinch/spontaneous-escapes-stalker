import { FlightClassLegend } from '@/components/common/flight-class-legend';
import { Toggle, ToggleProps } from '@/components/common/toggle';
import { Dispatch, SetStateAction } from 'react';
import { TableRowsPerPage } from '../../common/table/table-rows-per-page';
import {
  Button,
  cn,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/react';
import { FileTextIcon } from '@/components/icons/file-text';
import { trackEvent } from '@/analytics';
import { GlossaryModal } from './glossary-modal';

export type MonthColumnOrder = 'latest' | 'oldest';
const monthColumnOrderToggleOptions: ToggleProps<MonthColumnOrder>['options'] =
  [
    { key: 'latest', label: 'Latest first' },
    { key: 'oldest', label: 'Oldest first' },
  ];

export type ShowRoutesAs = 'separate' | 'combined';
const showRoutesAsToggleOptions: ToggleProps<ShowRoutesAs>['options'] = [
  { key: 'separate', label: 'Separate' },
  { key: 'combined', label: 'Combined' },
];

export function TopContent(props: {
  rowsPerPage: number;
  onRowsPerPageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  monthColumnOrder: MonthColumnOrder;
  setMonthColumnOrder: Dispatch<SetStateAction<MonthColumnOrder>>;
  showRoutesAs: ShowRoutesAs;
  setShowRoutesAs: Dispatch<SetStateAction<ShowRoutesAs>>;
}) {
  const {
    isOpen: isGlossaryModalOpen,
    onOpen: onGlossaryModalOpen,
    onOpenChange: onGlossaryModalOpenChange,
  } = useDisclosure();

  return (
    <div className="flex flex-col pl-2 gap-6 md:flex-row md:justify-between md:items-end">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 xl:gap-8 lg:items-end">
        <FlightClassLegend />

        <Toggle<MonthColumnOrder>
          options={monthColumnOrderToggleOptions}
          title="Toggle month column order"
          selValue={props.monthColumnOrder}
          setSelValue={props.setMonthColumnOrder}
        />

        <Toggle<ShowRoutesAs>
          options={showRoutesAsToggleOptions}
          title="Show routes as"
          selValue={props.showRoutesAs}
          setSelValue={props.setShowRoutesAs}
        />
      </div>

      <div className="flex flex-col gap-4 lg:gap-2 md:items-end">
        <div>
          <Button
            color="default"
            size="sm"
            startContent={
              <FileTextIcon width={16} height={16} strokeWidth={1} />
            }
            className={cn(
              'bg-transparent hover:bg-gray-100 border border-neutral-400 text-default-600 gap-1',
            )}
            // onPress prop doesn't work on mobile
            onClick={() => onGlossaryModalOpen()}
          >
            Glossary
          </Button>
          <GlossaryModal
            isOpen={isGlossaryModalOpen}
            onOpenChange={onGlossaryModalOpenChange}
          />
        </div>

        <TableRowsPerPage
          rowsPerPage={props.rowsPerPage}
          onRowsPerPageChange={props.onRowsPerPageChange}
        />
      </div>
    </div>
  );
}
