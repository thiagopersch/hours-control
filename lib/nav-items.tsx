import {
  BarChart3,
  Bell,
  Building2,
  CalendarClock,
  FileText,
  LayoutDashboard,
  Tags,
  UserCircle,
  Users,
  Users2,
} from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  resource: string | null;
};

export const navItems: NavItem[] = [
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
