"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ColoredSelectOption = {
  value: string
  label: string
  color?: string
}

type ColoredSelectProps = {
  options: ColoredSelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  placeholder?: string
  className?: string
  "aria-invalid"?: boolean
}

export function ColoredSelect({
  options,
  value,
  onValueChange,
  onBlur,
  disabled,
  placeholder,
  className,
  "aria-invalid": ariaInvalid,
}: ColoredSelectProps) {
  const sortedOptions = [...options].sort((a, b) =>
    a.label.localeCompare(b.label, "pt-BR")
  )

  return (
    <Select
      value={value}
      disabled={disabled}
      onValueChange={(val) => {
        if (val !== null) onValueChange?.(val)
      }}
      onOpenChange={(open) => {
        if (!open) onBlur?.()
      }}
    >
      <SelectTrigger className={className} aria-invalid={ariaInvalid} onBlur={onBlur}>
        <SelectValue placeholder={placeholder}>
          {(selected: string | null) => {
            const option = sortedOptions.find((o) => o.value === selected)
            if (!option) return placeholder
            return (
              <span className="flex items-center gap-2">
                {option.color && (
                  <span
                    className="inline-block shrink-0 rounded-full"
                    style={{ width: 8, height: 8, backgroundColor: option.color }}
                  />
                )}
                {option.label}
              </span>
            )
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {sortedOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.color && (
              <span
                className="inline-block shrink-0 rounded-full"
                style={{ width: 8, height: 8, backgroundColor: option.color }}
              />
            )}
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
