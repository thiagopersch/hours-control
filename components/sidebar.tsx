'use client';

import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { hasPermission } from '@/lib/permissions';
import { navItems, isNavGroup, type NavLeaf, type NavGroup } from '@/lib/nav-items';
import { useState } from 'react';

type SidebarProps = {
  onNavClick?: () => void;
  variant?: 'desktop' | 'mobile';
}

export function Sidebar({ onNavClick, variant = 'desktop' }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const { data: session } = useSession();
  const permissions = (session?.user as any)?.permissions as string[] | undefined;
  const isSuperAdmin = (session?.user as any)?.isSuperAdmin as boolean | undefined;

  const isCollapsed = variant === 'mobile' ? false : collapsed;

  function canSee(item: NavLeaf) {
    if (item.superAdminOnly && !isSuperAdmin) return false;
    if (item.resource && !hasPermission(permissions, item.resource)) return false;
    return true;
  }

  function isItemActive(item: NavLeaf) {
    return pathname === item.href || pathname.startsWith(item.href + '/');
  }

  function isGroupOpen(group: NavGroup, visibleItems: NavLeaf[]) {
    if (group.label in openGroups) return openGroups[group.label];
    return visibleItems.some(isItemActive);
  }

  function renderLeaf(item: NavLeaf) {
    const Icon = item.icon;
    const isActive = isItemActive(item);

    if (isCollapsed) {
      return (
        <Tooltip key={item.href}>
          <TooltipTrigger>
            <Link
              href={item.href}
              onClick={onNavClick}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <Icon className="h-5 w-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavClick}
        className={cn(
          'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {item.label}
      </Link>
    );
  }

  function renderGroup(group: NavGroup) {
    const visibleItems = group.items.filter(canSee);
    if (visibleItems.length === 0) return null;

    const GroupIcon = group.icon;
    const hasActiveItem = visibleItems.some(isItemActive);

    if (isCollapsed) {
      return (
        <DropdownMenu key={group.label}>
          <Tooltip>
            <TooltipTrigger
              render={
                <DropdownMenuTrigger
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                    hasActiveItem
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                />
              }
            >
              <GroupIcon className="h-5 w-5" />
            </TooltipTrigger>
            <TooltipContent side="right">{group.label}</TooltipContent>
          </Tooltip>
          <DropdownMenuContent side="right" align="start">
            {visibleItems.map((item) => (
              <DropdownMenuItem key={item.href} render={<Link href={item.href} onClick={onNavClick} />}>
                <item.icon className="size-4" />
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    const open = isGroupOpen(group, visibleItems);

    return (
      <Collapsible
        key={group.label}
        open={open}
        onOpenChange={(next) => setOpenGroups((prev) => ({ ...prev, [group.label]: next }))}
      >
        <CollapsibleTrigger
          className={cn(
            'flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
            'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          )}
        >
          <GroupIcon className="h-5 w-5 shrink-0" />
          <span className="flex-1 text-left">{group.label}</span>
          <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', open && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col gap-1 py-1 pl-4">
          {visibleItems.map(renderLeaf)}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r bg-card transition-[width] duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
          HC
        </div>
        {!isCollapsed && (
          <span className="font-semibold text-sm">HoursControl</span>
        )}
      </div>

      <ScrollArea className="flex-1 py-2">
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((entry) =>
            isNavGroup(entry) ? renderGroup(entry) : (canSee(entry) ? renderLeaf(entry) : null)
          )}
        </nav>
      </ScrollArea>

      {variant === 'desktop' && (
        <>
          <Separator />
          <div className="p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center"
              onClick={() => setCollapsed(!collapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </>
      )}
    </aside>
  );
}
