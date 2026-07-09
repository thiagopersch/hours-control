import {
  BarChart3,
  Building2,
  CalendarClock,
  FileText,
  FolderKanban,
  LayoutDashboard,
  ShieldCheck,
  Tags,
  UserCircle,
  Users,
  Users2,
} from 'lucide-react';

export type NavLeaf = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  resource: string | null;
  superAdminOnly?: boolean;
};

export type NavGroup = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavLeaf[];
};

export type NavEntry = NavLeaf | NavGroup;

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'items' in entry;
}

export const navItems: NavEntry[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, resource: null },
  { href: '/demands', label: 'Demandas', icon: CalendarClock, resource: 'demand' },
  {
    label: 'Cadastros',
    icon: FolderKanban,
    items: [
      { href: '/clients', label: 'Clientes', icon: Building2, resource: 'client' },
      { href: '/contracts', label: 'Contratos', icon: FileText, resource: 'contract' },
      { href: '/analysts', label: 'Analistas', icon: Users, resource: 'analyst' },
      { href: '/requesters', label: 'Solicitantes', icon: UserCircle, resource: 'requester' },
      { href: '/departments', label: 'Setores', icon: Building2, resource: 'department' },
      { href: '/demand-types', label: 'Tipos de Demanda', icon: Tags, resource: 'demand_type' },
      { href: '/tags', label: 'Tags', icon: Tags, resource: 'tag' },
    ],
  },
  {
    label: 'Segurança',
    icon: ShieldCheck,
    items: [
      { href: '/users', label: 'Usuários', icon: Users2, resource: 'user' },
      { href: '/roles', label: 'Perfis', icon: UserCircle, resource: 'role' },
    ],
  },
  {
    label: 'BI',
    icon: BarChart3,
    items: [
      { href: '/reports', label: 'Relatórios', icon: BarChart3, resource: 'report' },
    ],
  },
  {
    label: 'Super Admin',
    icon: Building2,
    items: [
      { href: '/organizations', label: 'Organizações', icon: Building2, resource: null, superAdminOnly: true },
    ],
  },
];

export function flattenNavItems(entries: NavEntry[] = navItems): NavLeaf[] {
  return entries.flatMap((entry) => (isNavGroup(entry) ? entry.items : [entry]));
}
