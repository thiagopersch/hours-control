"use client"

import { useState } from "react"
import { format, isValid } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type DatePickerProps = {
  value?: Date
  onChange: (date: Date | undefined) => void
  onBlur?: () => void
  disabled?: boolean
  placeholder?: string
  "aria-invalid"?: boolean
}

export function DatePicker({
  value,
  onChange,
  onBlur,
  disabled,
  placeholder = "Selecione uma data",
  "aria-invalid": ariaInvalid,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const hasValidValue = !!value && isValid(value)

  return (
    <div className="relative">
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) onBlur?.()
        }}
      >
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              disabled={disabled}
              aria-invalid={ariaInvalid}
              onBlur={onBlur}
              className={cn(
                "w-full justify-start text-left font-normal",
                !hasValidValue && "text-muted-foreground",
                hasValidValue && "pr-8"
              )}
            />
          }
        >
          <CalendarIcon className="mr-2 size-4 shrink-0" />
          {hasValidValue ? format(value, "dd/MM/yyyy") : placeholder}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={hasValidValue ? value : undefined}
            onSelect={(date) => {
              onChange(date)
              setOpen(false)
            }}
            autoFocus
          />
        </PopoverContent>
      </Popover>
      {hasValidValue && !disabled && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 size-6"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(undefined)
                }}
              />
            }
          >
            <X className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>Limpar campo</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
