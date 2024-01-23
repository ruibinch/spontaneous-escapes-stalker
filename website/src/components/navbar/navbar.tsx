import { Input, Navbar, NavbarContent, Tooltip } from '@nextui-org/react';
import { SearchIcon } from '../icons/search';
import { MenuButton } from './menu-button';
import { MessageCircleIcon } from '../icons/message-circle';
import { HelpCircleIcon } from '../icons/help-circle';

export const NavbarWrapper = () => {
  return (
    <Navbar
      isBordered
      className="w-full"
      classNames={{
        wrapper: 'w-full max-w-full',
      }}
    >
      <NavbarContent className="md:hidden" justify="start">
        <MenuButton />
      </NavbarContent>
      <NavbarContent className="w-full">
        {/* <Input
          startContent={<SearchIcon />}
          isClearable
          className="w-full"
          classNames={{
            base: 'max-w-full',
            inputWrapper: 'h-full',
          }}
          placeholder="Search"
        /> */}
      </NavbarContent>
      <NavbarContent
        justify="end"
        className="w-fit data-[justify=end]:flex-grow-0"
      >
        <div className="flex items-center gap-4">
          <Tooltip content="Give feedback">
            <div className="cursor-pointer">
              <MessageCircleIcon />
            </div>
          </Tooltip>
          <Tooltip content="Help">
            <div className="cursor-pointer">
              <HelpCircleIcon />
            </div>
          </Tooltip>
        </div>
      </NavbarContent>
    </Navbar>
  );
};
