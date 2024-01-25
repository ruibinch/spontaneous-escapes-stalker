import { usePathname } from 'next/navigation';
import { useSidebarContext } from '../layout/layout-context';
import { barItems } from './bar-items';
import { SidebarItem } from './sidebar-item';
import { BarStyles } from './bar.styles';

export const SidebarWrapper = () => {
  const pathname = usePathname();
  const { collapsed } = useSidebarContext();

  return (
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
          <div className="flex flex-col gap-1 mt-9">
            {barItems.map((item) => (
              <SidebarItem
                key={item.title}
                title={item.title}
                icon={item.icon}
                isActive={pathname === item.href}
                href={item.href}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
