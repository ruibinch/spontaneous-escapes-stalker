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
} from '@heroui/react';
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
        className="w-full text-nav-text hover:bg-nav-hover hover:text-nav-text-active"
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
