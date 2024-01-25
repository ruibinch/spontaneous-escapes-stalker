import { Navbar, NavbarContent, cn } from '@nextui-org/react';
import { MessageCircleIcon } from '../icons/message-circle';
import { HelpCircleIcon } from '../icons/help-circle';
import { NavbarItem } from './navbar-item';
import { usePathname } from 'next/navigation';
import { barItems } from './bar-items';

export const NavbarWrapper = () => {
  const pathname = usePathname();

  return (
    <Navbar
      isBordered
      className={cn(
        'w-full h-14',
        'lg:hidden',
        'bg-gradient-to-r from-blue-900 to-indigo-900',
      )}
    >
      <NavbarContent justify="start">
        <div className="flex flex-row gap-4">
          {barItems.map((item) => (
            <NavbarItem
              key={item.title}
              title={item.title}
              icon={item.icon}
              isActive={pathname === item.href}
              href={item.href}
            />
          ))}
        </div>
      </NavbarContent>
      {/* <NavbarContent
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
      </NavbarContent> */}
    </Navbar>
  );
};
