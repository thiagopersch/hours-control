"use client"

import { Input } from "@/components/ui/input"
import { formatDocument } from "@/lib/masks"

type DocumentInputProps = {
  value?: string
  onChange: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  placeholder?: string
  className?: string
  "aria-invalid"?: boolean
}

export function DocumentInput({
  value,
  onChange,
  onBlur,
  disabled,
  placeholder = "CPF ou CNPJ",
  className,
  "aria-invalid": ariaInvalid,
}: DocumentInputProps) {
  return (
    <Input
      type="text"
      inputMode="numeric"
      value={formatDocument(value)}
      onChange={(e) => onChange(formatDocument(e.target.value))}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
      aria-invalid={ariaInvalid}
      maxLength={18}
    />
  )
}
