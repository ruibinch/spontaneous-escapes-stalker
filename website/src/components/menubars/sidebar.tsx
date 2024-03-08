import { usePathname } from 'next/navigation';
import { useSidebarContext } from '../../layout/layout-context';
import { additionalEndBarItems, endBarItems, startBarItems } from './bar-items';
import { BarStyles } from './bar.styles';
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

            <div className="mt-2 flex gap-2">
              {additionalEndBarItems.map((item) => (
                <div key={item.key} className="flex-1">
                  {item.item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
