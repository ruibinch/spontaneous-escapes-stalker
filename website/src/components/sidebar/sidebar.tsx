import { usePathname } from 'next/navigation';
import { useSidebarContext } from '../layout/layout-context';
import { CollapseItems } from './collapse-items';
import { SidebarItem } from './sidebar-item';
import { Sidebar } from './sidebar.styles';

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
              href="analysis"
            />
            <CollapseItems
              items={['Banks Accounts', 'Credit Cards', 'Loans']}
              title="By Month"
            />
            <CollapseItems
              items={['Banks Accounts', 'Credit Cards', 'Loans']}
              title="By Route"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
