'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const monthNames = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

type PeriodFilterProps = {
  year: string;
  onYearChange: (year: string) => void;
  month: string;
  onMonthChange: (month: string) => void;
};

export function PeriodFilter({
  year,
  onYearChange,
  month,
  onMonthChange,
}: PeriodFilterProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="flex items-center gap-2">
      <Select
        value={year || 'all'}
        onValueChange={(v) => {
          if (v === null) return;
          onYearChange(v === 'all' ? '' : v);
          if (v === 'all') onMonthChange('');
        }}
      >
        <SelectTrigger className="w-[110px]" size="sm">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os anos</SelectItem>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={month || 'all'}
        onValueChange={(v) => {
          if (v === null) return;
          onMonthChange(v === 'all' ? '' : v);
        }}
        disabled={!year}
      >
        <SelectTrigger className="w-[140px]" size="sm">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os meses</SelectItem>
          {monthNames.map((name, i) => (
            <SelectItem key={name} value={String(i + 1)}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
