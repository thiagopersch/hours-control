'use client';

import {
  BarChart3,
  Bell,
  Building2,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Tags,
  UserCircle,
  Users,
  Users2,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  resource: string | null;
};

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, resource: null },
  { href: '/demands', label: 'Demandas', icon: CalendarClock, resource: 'demand' },
  { href: '/clients', label: 'Clientes', icon: Building2, resource: 'client' },
  { href: '/contracts', label: 'Contratos', icon: FileText, resource: 'contract' },
  { href: '/analysts', label: 'Analistas', icon: Users, resource: 'analyst' },
  { href: '/requesters', label: 'Solicitantes', icon: UserCircle, resource: 'requester' },
  { href: '/departments', label: 'Setores', icon: Building2, resource: 'department' },
  { href: '/demand-types', label: 'Tipos de Demanda', icon: Tags, resource: 'demand_type' },
  { href: '/tags', label: 'Tags', icon: Tags, resource: 'tag' },
  { href: '/users', label: 'Usuários', icon: Users2, resource: 'user' },
  { href: '/roles', label: 'Perfis', icon: UserCircle, resource: 'role' },
  { href: '/reports', label: 'Relatórios', icon: BarChart3, resource: 'report' },
  { href: '/notifications', label: 'Notificações', icon: Bell, resource: 'notification' },
];

type SidebarProps = {
  onNavClick?: () => void;
  variant?: 'desktop' | 'mobile';
}

export function Sidebar({ onNavClick, variant = 'desktop' }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);

  const isCollapsed = variant === 'mobile' ? false : collapsed;

  const filteredItems = navItems

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r bg-card transition-all duration-300',
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
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');

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
          })}
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
