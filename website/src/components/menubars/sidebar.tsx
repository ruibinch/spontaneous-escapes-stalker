import { useNewChangelogItemContext } from '@/contexts/new-changelog-item-context';
import { useSidebarContext } from '@/contexts/sidebar-context';
import { usePathname } from 'next/navigation';
import { SilkairRoutesToggle } from '../common/silkair-routes-toggle';
import { additionalEndBarItems, endBarItems, startBarItems } from './bar-items';
import { BarStyles } from './bar.styles';
import { SidebarItem } from './sidebar-item';

export const SidebarWrapper = () => {
  const pathname = usePathname();
  const { collapsed } = useSidebarContext();
  const { hasNewItem } = useNewChangelogItemContext();

  const isItemActive = (item: { href: string }) => {
    return item.href === '/'
      ? pathname === item.href
      : pathname.startsWith(item.href);
  };

  return (
    <aside className="h-screen sticky top-0">
      <div
        className={BarStyles.SidebarWrapper({
          collapsed,
        })}
      >
        <div className="flex flex-col px-3 pt-6 pb-2">
          <span className="text-sm font-bold text-text-primary tracking-tight">
            KrisFlyer SEAT
          </span>
          <span className="text-2xs text-text-muted leading-tight">
            Spontaneous Escapes Analysis Tool
          </span>
        </div>

        <div className="flex flex-col justify-between h-full">
          <div className="flex flex-col gap-1 mt-6">
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

          <div className="flex flex-col gap-1 mb-4">
            {endBarItems.map((item) => (
              <SidebarItem
                key={item.title}
                title={item.title}
                icon={item.icon}
                isActive={isItemActive(item)}
                href={item.href}
                showRedDot={item.title === 'Changelog' && hasNewItem}
              />
            ))}

            <div className="mt-3 pt-3 border-t border-border flex flex-col gap-3">
              <div className="px-1">
                <SilkairRoutesToggle />
              </div>
              <div className="flex gap-2">
                {additionalEndBarItems.map((item) => (
                  <div key={item.key} className="flex-1">
                    {item.item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
