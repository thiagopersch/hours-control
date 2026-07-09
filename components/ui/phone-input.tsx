"use client"

import { Input } from "@/components/ui/input"
import { formatPhone } from "@/lib/masks"

type PhoneInputProps = {
  value?: string
  onChange: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  placeholder?: string
  className?: string
  "aria-invalid"?: boolean
}

export function PhoneInput({
  value,
  onChange,
  onBlur,
  disabled,
  placeholder = "(00) 00000-0000",
  className,
  "aria-invalid": ariaInvalid,
}: PhoneInputProps) {
  return (
    <Input
      type="text"
      inputMode="tel"
      value={formatPhone(value)}
      onChange={(e) => onChange(formatPhone(e.target.value))}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
      aria-invalid={ariaInvalid}
      maxLength={15}
    />
  )
}
