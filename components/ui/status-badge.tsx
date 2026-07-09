"use client"

import { Badge } from "@/components/ui/badge"

type StatusBadgeProps = {
  label: string
  color: string
  className?: string
}

export function StatusBadge({ label, color, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={className}
      style={{ backgroundColor: `${color}26`, borderColor: `${color}40`, color }}
    >
      {label}
    </Badge>
  )
}
