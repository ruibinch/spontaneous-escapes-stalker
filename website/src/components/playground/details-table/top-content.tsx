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
} from '@nextui-org/react';
import { FileTextIcon } from '@/components/icons/file-text';
import { trackEvent } from '@/analytics';

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

      <div className="flex flex-col gap-4 md:items-end">
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

function GlossaryModal({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
}) {
  return (
    <Modal
      size="lg"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Glossary</ModalHeader>
            <ModalBody className="flex gap-4">
              <div className="flex flex-col gap-4">
              <div className='flex flex-col gap-2'>
                  <p className="text-sm font-semibold">Count</p>
                  <span className="text-sm">Number of redemption months.</span>
                </div>

                <div className='flex flex-col gap-2'>
                  <p className="text-sm font-semibold">Blackout %</p>
                  <span className="text-sm">
                    Equivalent to the total number of blackout days for all
                    flights, divided by the number of flights multiplied by the
                    number of days in the month.
                  </span>
                  <span className="text-sm">
                    A day is considered a blackout day as long as it is within
                    the blackout period for any flight class.
                  </span>
                  <span className="text-sm">
                    e.g. if a route has 2 flights in June, where each flight has
                    3 blackout days, then blackout % = (3+3)/(2*30) = 10%.
                  </span>
                  <span className="text-sm italic">
                    The limitation of this formula is that all flights are
                    considered equally in terms of number of seats, which is
                    inaccurate, but this figure can nevertheless serve as a
                    decent estimate.
                  </span>
                </div>

                <div className='flex flex-col gap-2'>
                  <p className="text-sm font-semibold">Avg Blackout %</p>
                  <span className="text-sm">
                    Sum of blackout % across months, divided by number of months.
                  </span>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button onPress={onClose}>Close</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
