'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { hasPermission } from '@/lib/permissions';
import { formatDuration } from '@/lib/utils';
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  FileText,
  Users,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRef } from 'react';
import {
  useAnalysts,
  useClients,
  useContracts,
  useDemandStats,
  usePeriodFilter,
} from './hooks/use-dashboard';
import { ChartCard } from './ui/chart-card';
import { DashboardExportButton } from './ui/export-button';
import { PeriodFilter } from './ui/period-filter';
import { StatCard, StatCardSkeleton } from './ui/stat-card';

const statusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em Andamento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  ON_HOLD: 'Pausado',
};

const statusColors: Record<string, string> = {
  PENDING: '#f59e0b',
  IN_PROGRESS: '#3b82f6',
  COMPLETED: '#22c55e',
  CANCELLED: '#ef4444',
  ON_HOLD: '#8b5cf6',
};

const priorityLabels: Record<string, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

const priorityColors: Record<string, string> = {
  LOW: '#22c55e',
  MEDIUM: '#f59e0b',
  HIGH: '#f97316',
  URGENT: '#ef4444',
};

const monthNames = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

function truncate(name: string, max = 16) {
  return name.length > max ? name.slice(0, max) + '...' : name;
}

function utilizationColor(pct: number) {
  if (pct > 100) return '#ef4444';
  if (pct >= 80) return '#f59e0b';
  return '#22c55e';
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const isSuperAdmin = !!(session?.user as any)?.isSuperAdmin;
  const permissions = (session?.user as any)?.permissions;
  const canViewFinancials = isSuperAdmin || hasPermission(permissions, 'analyst');
  const canViewClients = isSuperAdmin || hasPermission(permissions, 'client');
  const canViewAnalysts = isSuperAdmin || hasPermission(permissions, 'analyst');
  const canViewContracts = isSuperAdmin || hasPermission(permissions, 'contract');

  const { year, setYear, month, setMonth, filters } = usePeriodFilter();
  const {
    data: stats,
    error: statsError,
    isLoading: statsLoading,
  } = useDemandStats(filters);
  const { data: clients } = useClients({ enabled: canViewClients });
  const { data: analysts } = useAnalysts({ enabled: canViewAnalysts });
  const { data: contracts } = useContracts({ enabled: canViewContracts });

  const evolutionRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<HTMLDivElement>(null);
  const analystRef = useRef<HTMLDivElement>(null);

  const counts = {
    clients: clients?.filter((c: any) => c.status === 'active').length ?? 0,
    analysts: analysts?.filter((a: any) => a.status === 'active').length ?? 0,
    contracts: contracts?.filter((c: any) => c.status === 'ACTIVE').length ?? 0,
  };

  const monthlyEvolutionRaw = stats?.monthlyEvolution ?? [];
  const monthlyData = monthlyEvolutionRaw.map((m) => ({
    name: `${monthNames[m.month - 1]}/${m.year}`,
    value: m.totalMinutes,
    horas: Math.round(m.totalMinutes / 60),
    demandas: m.count,
  }));

  const statusDataRaw = stats?.byStatus ?? [];
  const statusData = statusDataRaw.map((s) => ({
    name: statusLabels[s.status] ?? s.status,
    value: s.count,
    color: statusColors[s.status] ?? '#6b7280',
  }));

  const clientDataRaw = stats?.byClient ?? [];
  const clientData = clientDataRaw.map((c) => ({
    name:
      c.clientName.length > 16
        ? c.clientName.slice(0, 16) + '...'
        : c.clientName,
    value: c.totalMinutes,
    horas: Math.round(c.totalMinutes / 60),
  }));

  const analystDataRaw = stats?.byAnalyst ?? [];
  const analystData = analystDataRaw.map((a) => ({
    name:
      a.analystName.length > 16
        ? a.analystName.slice(0, 16) + '...'
        : a.analystName,
    value: a.totalMinutes,
    horas: Math.round(a.totalMinutes / 60),
    color: a.analystColor,
  }));

  const totalMinutes = monthlyEvolutionRaw.reduce(
    (acc, m) => acc + m.totalMinutes,
    0,
  );

  const totalAnalystMinutes = analystDataRaw.reduce(
    (acc, a) => acc + a.totalMinutes,
    0,
  );
  const workloadData = analystDataRaw.map((a) => ({
    name: truncate(a.analystName),
    value: totalAnalystMinutes
      ? Math.round((a.totalMinutes / totalAnalystMinutes) * 1000) / 10
      : 0,
    color: a.analystColor,
  }));

  const priorityDataRaw = stats?.byPriority ?? [];
  const priorityData = priorityDataRaw.map((p) => ({
    name: priorityLabels[p.priority] ?? p.priority,
    value: Math.round(p.avgMinutes),
    color: priorityColors[p.priority] ?? '#6b7280',
  }));

  const departmentDataRaw = stats?.byDepartment ?? [];
  const departmentData = departmentDataRaw.map((d) => ({
    name: truncate(d.departmentName),
    value: d.totalMinutes,
  }));

  const demandTypeDataRaw = stats?.byDemandType ?? [];
  const demandTypeData = demandTypeDataRaw.map((d) => ({
    name: truncate(d.demandTypeName),
    value: d.totalMinutes,
    color: d.demandTypeColor,
  }));

  const clientFinancialsRaw = stats?.clientFinancials ?? [];
  const utilizationData = clientFinancialsRaw.map((c) => {
    const pct = c.contractedHours
      ? Math.round((c.consumedHours / c.contractedHours) * 1000) / 10
      : 0;
    return {
      name: truncate(c.clientName),
      value: pct,
      color: utilizationColor(pct),
    };
  });
  const marginData = clientFinancialsRaw.map((c) => ({
    name: truncate(c.clientName),
    value: Math.round(c.margin),
    color: c.margin >= 0 ? '#22c55e' : '#ef4444',
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema</p>
        </div>
        <div className="flex items-center gap-2 max-md:flex-col max-md:w-full max-md:items-stretch">
          <PeriodFilter
            year={year}
            onYearChange={setYear}
            month={month}
            onMonthChange={setMonth}
          />
          <DashboardExportButton
            monthlyData={monthlyData}
            statusData={statusData}
            clientData={clientData}
            analystData={analystData}
            chartRefs={[evolutionRef, statusRef, clientRef, analystRef]}
          />
        </div>
      </div>

      {statsError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados do dashboard. Tente novamente mais tarde.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Demandas"
              value={stats?.total ?? 0}
              icon={CalendarClock}
            />
            <StatCard
              title="Horas Lançadas"
              value={formatDuration(totalMinutes)}
              icon={CalendarClock}
            />
            {canViewClients && (
              <StatCard
                title="Clientes"
                value={counts.clients}
                icon={Building2}
              />
            )}
            {canViewAnalysts && (
              <StatCard title="Analistas" value={counts.analysts} icon={Users} />
            )}
            {canViewContracts && (
              <StatCard
                title="Contratos ativos"
                value={counts.contracts}
                icon={FileText}
              />
            )}
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Evolução Mensal (horas)"
          data={monthlyData}
          valueLabel="horas"
          valueFormat="duration"
          defaultType="linha"
          chartRef={evolutionRef}
        />
        <ChartCard
          title="Demandas por Status (Quantidade)"
          data={statusData}
          valueLabel="demandas"
          defaultType="pizza"
          chartRef={statusRef}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Top Clientes (horas)"
          data={clientData}
          valueLabel="horas"
          valueFormat="duration"
          defaultType="barra"
          chartRef={clientRef}
        />
        <ChartCard
          title="Top Analistas (horas)"
          data={analystData}
          valueLabel="horas"
          valueFormat="duration"
          defaultType="barra"
          chartRef={analystRef}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {canViewFinancials && (
          <ChartCard
            title="Utilização de Contratos (%)"
            data={utilizationData}
            valueLabel="% utilizado"
            valueFormat="percent"
            defaultType="barra"
          />
        )}
        {canViewFinancials && (
          <ChartCard
            title="Margem por Cliente (R$)"
            data={marginData}
            valueLabel="margem (R$)"
            valueFormat="currency"
            defaultType="barra"
          />
        )}
        <ChartCard
          title="Carga de Trabalho por Analista (%)"
          data={workloadData}
          valueLabel="% do total"
          valueFormat="percent"
          defaultType="pizza"
          showLabels
        />
        <ChartCard
          title="Duração Média por Prioridade (horas)"
          data={priorityData}
          valueLabel="horas"
          valueFormat="duration"
          defaultType="barra"
        />
        <ChartCard
          title="Demandas por Setor (horas)"
          data={departmentData}
          valueLabel="horas"
          valueFormat="duration"
          defaultType="barra"
        />
        <ChartCard
          title="Demandas por Tipo (horas)"
          data={demandTypeData}
          valueLabel="horas"
          valueFormat="duration"
          defaultType="pizza"
          showLabels
        />
      </div>
    </div>
  );
}
