import { trackEvent } from '@/analytics';
import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Link,
} from '@nextui-org/react';
import { CoffeeIcon } from '../icons/coffee';

export function CoffeeItem() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <div>
      <Button
        size="sm"
        radius="sm"
        variant="light"
        isIconOnly
        // onPress prop doesn't work on mobile
        onClick={() => {
          trackEvent(['coffee']);
          onOpen();
        }}
        className="w-full text-neutral-300/75 hover:bg-neutral-300/25 hover:dark:bg-neutral-300/25 hover:text-white"
      >
        <CoffeeIcon />
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalBody>
            <p>Thanks for the kopi money!</p>
          </ModalBody>
          <ModalFooter>
            <Button
              href="https://www.buymeacoffee.com/ruibinch"
              as={Link}
              color="primary"
              onClick={() => {
                trackEvent(['coffeeExternal']);
              }}
              isExternal
            >
              Buy me a Kopi
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
