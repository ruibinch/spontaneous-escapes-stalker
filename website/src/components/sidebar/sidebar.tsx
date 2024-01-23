import { usePathname } from 'next/navigation';
import { useSidebarContext } from '../layout/layout-context';
import { SidebarItem } from './sidebar-item';
import { Sidebar } from './sidebar.styles';
import { GlobeIcon } from '../icons/globe';
import { PieChartIcon } from '../icons/pie-chart';
import { CalendarIcon } from '../icons/calendar';
import { MapIcon } from '../icons/map';

export const SidebarWrapper = () => {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebarContext();

  return (
    <aside className="h-screen z-[202] sticky top-0">
      {collapsed ? (
        <div className={Sidebar.Overlay()} onClick={setCollapsed} />
      ) : null}

      <div
        className={Sidebar({
          collapsed: collapsed,
        })}
      >
        <div className={Sidebar.Header()}>
          {/* {<h1 className="font-semibold">SOME_NICE_LOGO</h1>} */}
        </div>

        <div className="flex flex-col justify-between h-full">
          <div className={Sidebar.Body()}>
            <SidebarItem
              title="Playground"
              icon={<GlobeIcon />}
              isActive={pathname === '/'}
              href="/"
            />
            <SidebarItem
              title="Analysis"
              icon={<PieChartIcon />}
              isActive={pathname === '/analysis'}
              href="/analysis"
            />
            <SidebarItem
              title="View by Month"
              icon={<CalendarIcon />}
              isActive={pathname === '/month'}
              href="/month"
            />
            <SidebarItem
              title="View by Route"
              icon={<MapIcon />}
              isActive={pathname === '/route'}
              href="/route"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
