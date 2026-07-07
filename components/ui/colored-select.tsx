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
  placeholder?: string
  className?: string
}

export function ColoredSelect({
  options,
  value,
  onValueChange,
  placeholder,
  className,
}: ColoredSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(val) => {
        if (val !== null) onValueChange?.(val)
      }}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.color && (
              <span
                className="inline-block rounded-full"
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
