import { ENABLE_COFFEE } from '@/common/env';
import { usePathname } from 'next/navigation';
import { useSidebarContext } from '../../layout/layout-context';
import { endBarItems, startBarItems } from './bar-items';
import { BarStyles } from './bar.styles';
import { CoffeeItem } from './coffee-item';
import { SidebarItem } from './sidebar-item';

export const SidebarWrapper = () => {
  const pathname = usePathname();
  const { collapsed } = useSidebarContext();

  const isItemActive = (item: { href: string }) => {
    return item.href === '/'
      ? pathname === item.href
      : pathname.startsWith(item.href);
  };

  return (
    // TODO: fix non-sticky sidebar when scrolling
    <aside className="h-screen sticky top-0">
      <div
        className={BarStyles.SidebarWrapper({
          collapsed: collapsed,
        })}
      >
        <div className="flex gap-8 items-center px-6">
          {/* {<h1 className="font-semibold">SOME_NICE_LOGO</h1>} */}
        </div>

        <div className="flex flex-col justify-between h-full">
          <div className="flex flex-col gap-2 mt-12">
            {startBarItems.map((item) => (
              <SidebarItem
                key={item.title}
                title={item.title}
                icon={item.icon}
                isActive={isItemActive(item)}
                href={item.href}
              />
            ))}
          </div>

          <div className="flex flex-col gap-2 mb-4">
            {endBarItems.map((item) => (
              <SidebarItem
                key={item.title}
                title={item.title}
                icon={item.icon}
                isActive={isItemActive(item)}
                href={item.href}
              />
            ))}

            {ENABLE_COFFEE && (
              <div className="mt-2">
                <CoffeeItem />
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
