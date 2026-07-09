import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

/**
 * Formats a date-only value (Demand.date, ClientContract.startDate/endDate).
 * These are stored as UTC midnight (e.g. "2026-09-30T00:00:00.000Z") with no
 * meaningful time component, so formatting must read the UTC calendar day —
 * otherwise browsers behind UTC (like pt-BR) roll it back to the previous day.
 */
export function formatDate(date: string | Date): string {
  if (!date) return "-"
  const d = new Date(date)
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" })
}

/**
 * Converts a date-only ISO value (see {@link formatDate}) into a Date object
 * anchored at local midnight of that same calendar day, so it can be handed
 * to local-timezone-aware UI (DatePicker, date-fns `format`) without shifting.
 */
export function parseDateOnly(date: string | Date): Date {
  const d = new Date(date)
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

export function formatDateTime(date: string | Date): string {
  if (!date) return "-"
  const d = new Date(date)
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDuration(minutes: number): string {
  if (!minutes && minutes !== 0) return "-"
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}
