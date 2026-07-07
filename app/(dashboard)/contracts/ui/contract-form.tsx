"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Field, FieldError } from "@/components/ui/field"
import { DatePicker } from "@/components/ui/date-picker"
import { ColoredSelect } from "@/components/ui/colored-select"
import { contractSchema, type ContractFormData } from "../schema/contract-schema"

const statusOptions = [
  { value: "active", label: "Ativo", color: "#22c55e" },
  { value: "inactive", label: "Inativo", color: "#6b7280" },
  { value: "completed", label: "Concluído", color: "#3b82f6" },
  { value: "cancelled", label: "Cancelado", color: "#ef4444" },
]

type ContractFormProps = {
  clients: { id: string; name: string; color?: string }[]
  defaultValues?: Partial<ContractFormData>
  onSubmit: (data: ContractFormData) => void
  loading?: boolean
}

export function ContractForm({
  clients,
  defaultValues,
  onSubmit,
  loading,
}: ContractFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      clientId: "",
      contractedHours: 0,
      hourlyRate: 0,
      notes: "",
      status: "active",
      ...defaultValues,
    },
  })

  const clientOptions = clients.map((c) => ({
    value: c.id,
    label: c.name,
    color: c.color,
  }))

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>
          {defaultValues?.clientId ? "Editar Contrato" : "Novo Contrato"}
        </DialogTitle>
        <DialogDescription>Preencha os dados do contrato abaixo.</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field>
          <Label>
            Cliente <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="clientId"
            control={control}
            render={({ field }) => (
              <ColoredSelect
                options={clientOptions}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Selecione um cliente"
              />
            )}
          />
          <FieldError errors={[errors.clientId]} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <Label>
              Horas Contratadas <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              step="0.5"
              {...register("contractedHours", { valueAsNumber: true })}
            />
            <FieldError errors={[errors.contractedHours]} />
          </Field>
          <Field>
            <Label>
              Valor Hora (R$) <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              step="0.01"
              {...register("hourlyRate", { valueAsNumber: true })}
            />
            <FieldError errors={[errors.hourlyRate]} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <Label>
              Data Início <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={(date) => field.onChange(date)}
                  placeholder="Selecione a data"
                />
              )}
            />
            <FieldError errors={[errors.startDate]} />
          </Field>
          <Field>
            <Label>
              Data Término <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={(date) => field.onChange(date)}
                  placeholder="Selecione a data"
                />
              )}
            />
            <FieldError errors={[errors.endDate]} />
          </Field>
        </div>

        <Field>
          <Label>Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <ColoredSelect
                options={statusOptions}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Selecione o status"
              />
            )}
          />
          <FieldError errors={[errors.status]} />
        </Field>

        <Field>
          <Label>Observações</Label>
          <Textarea {...register("notes")} />
          <FieldError errors={[errors.notes]} />
        </Field>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
