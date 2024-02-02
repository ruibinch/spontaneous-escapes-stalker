import { usePathname } from 'next/navigation';
import { useSidebarContext } from '../../layout/layout-context';
import { barItems } from './bar-items';
import { SidebarItem } from './sidebar-item';
import { BarStyles } from './bar.styles';

export const SidebarWrapper = () => {
  const pathname = usePathname();
  const { collapsed } = useSidebarContext();

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
          <div className="flex flex-col gap-2 mt-9">
            {barItems.map((item) => (
              <SidebarItem
                key={item.title}
                title={item.title}
                icon={item.icon}
                isActive={
                  item.href === '/'
                    ? pathname === item.href
                    : pathname.startsWith(item.href)
                }
                href={item.href}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
