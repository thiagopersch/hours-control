"use client"

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { cn } from "@/lib/utils"

type MultiSelectOption = {
  value: string
  label: string
}

type MultiSelectProps = {
  options: MultiSelectOption[]
  value: string[]
  onValueChange: (value: string[]) => void
  onBlur?: () => void
  disabled?: boolean
  placeholder?: string
  emptyMessage?: string
  className?: string
  "aria-invalid"?: boolean
}

export function MultiSelect({
  options,
  value,
  onValueChange,
  onBlur,
  disabled,
  placeholder = "Selecione...",
  emptyMessage = "Nenhum resultado encontrado.",
  className,
  "aria-invalid": ariaInvalid,
}: MultiSelectProps) {
  const anchor = useComboboxAnchor()
  const selected = options.filter((option) => value.includes(option.value))

  return (
    <Combobox
      items={options}
      multiple
      disabled={disabled}
      value={selected}
      onValueChange={(next: MultiSelectOption[]) => onValueChange(next.map((o) => o.value))}
      isItemEqualToValue={(item: MultiSelectOption, val: MultiSelectOption) => item.value === val.value}
      onOpenChange={(open: boolean) => {
        if (!open) onBlur?.()
      }}
    >
      <ComboboxChips ref={anchor} className={cn("w-full", className)} aria-invalid={ariaInvalid} onBlur={onBlur}>
        <ComboboxValue>
          {(items: MultiSelectOption[]) => (
            <>
              {items.map((item) => (
                <ComboboxChip key={item.value}>{item.label}</ComboboxChip>
              ))}
              <ComboboxChipsInput placeholder={items.length ? "" : placeholder} />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        <ComboboxList>
          {(item: MultiSelectOption) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
