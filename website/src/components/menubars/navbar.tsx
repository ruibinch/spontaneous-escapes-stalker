import { Navbar, NavbarContent } from '@nextui-org/react';
import { usePathname } from 'next/navigation';
import { endBarItems, startBarItems } from './bar-items';
import { NavbarItem } from './navbar-item';
import { CoffeeItem } from './coffee-item';
import { ENABLE_COFFEE } from '@/common/env';

export const NavbarWrapper = () => {
  const pathname = usePathname();

  const isItemActive = (item: { href: string }) => {
    return item.href === '/'
      ? pathname === item.href
      : pathname.startsWith(item.href);
  };

  return (
    <Navbar
      isBordered
      height="3.5rem" // 56px
      classNames={{
        base: 'lg:hidden bg-gradient-to-r from-blue-900 to-indigo-900',
        wrapper: 'px-4',
      }}
    >
      <NavbarContent justify="start">
        <div className="flex gap-2">
          {startBarItems.map((item) => (
            <NavbarItem
              key={item.title}
              title={item.title}
              icon={item.icon}
              isActive={isItemActive(item)}
              href={item.href}
            />
          ))}
        </div>
      </NavbarContent>
      <NavbarContent
        justify="end"
        className="w-fit data-[justify=end]:flex-grow-0"
      >
        <div className="flex gap-2 items-center">
          {endBarItems.map((item) => (
            <NavbarItem
              key={item.title}
              title={item.title}
              icon={item.icon}
              isActive={isItemActive(item)}
              href={item.href}
            />
          ))}

          {ENABLE_COFFEE && <CoffeeItem />}
        </div>
      </NavbarContent>
    </Navbar>
  );
};
