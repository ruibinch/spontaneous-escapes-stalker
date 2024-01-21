import { getMonthsList } from '@/common/get-data-time-range';
import { usePathname } from 'next/navigation';
import { useSidebarContext } from '../layout/layout-context';
import { SidebarCollapsibleItem } from './sidebar-collapsible-item';
import { SidebarItem } from './sidebar-item';
import { Sidebar } from './sidebar.styles';
import { monthNumToNameMap } from '@/common/months-map';

export const SidebarWrapper = () => {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebarContext();

  const monthsList = getMonthsList();
  const monthsListItems = [...monthsList].reverse().map((month) => ({
    label: `${month.slice(0, 4)}-${month.slice(4, 6)}`,
    value: month,
    keywords: [monthNumToNameMap[month.slice(4, 6)]],
  }));

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
        <div className="flex flex-col justify-between h-full">
          <div className={Sidebar.Body()}>
            <SidebarItem
              title="Playground"
              isActive={pathname === '/'}
              href="/"
            />
            <SidebarItem
              title="Analysis"
              isActive={pathname === '/analysis'}
              href="/analysis"
            />
            <SidebarCollapsibleItem
              title="View by Month"
              items={monthsListItems}
              filterPlaceholder="Filter month"
            />
            {/* <CollapseItems
              items={['Banks Accounts', 'Credit Cards', 'Loans']}
              title="By Route"
            /> */}
          </div>
        </div>
      </div>
    </aside>
  );
};
