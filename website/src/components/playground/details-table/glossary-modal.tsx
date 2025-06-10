import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@heroui/react';

export function GlossaryModal({
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
              <div className="flex flex-col gap-4 text-sm">
                <div className="flex flex-col gap-2">
                  <p className="font-semibold">Months</p>
                  <span>
                    Number of months with a redemption in at least one flight
                    class.
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="font-semibold">Redemptions</p>
                  <span>
                    Total number of redemptions across all flight classes.
                  </span>
                  <span className="italic">
                    Note that routes with no Premium Economy class will have a
                    lower figure relative to routes with it.
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="font-semibold">Blackout %</p>
                  <span>
                    Equivalent to the total number of blackout days for all
                    flights, divided by the number of flights multiplied by the
                    number of days in the month.
                  </span>
                  <span>
                    A day is considered a blackout day as long as it is within
                    the blackout period for any flight class.
                  </span>
                  <span>
                    e.g. if a route has 2 flights in June, where each flight has
                    3 blackout days, then blackout % = (3+3)/(2*30) = 10%.
                  </span>
                  <span className="italic">
                    The limitation of this formula is that all flights are
                    considered equally in terms of number of seats, which is
                    inaccurate, but this figure can nevertheless serve as a
                    decent estimate.
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="font-semibold">Avg Blackout %</p>
                  <span>
                    Sum of blackout % across months, divided by number of
                    months.
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
