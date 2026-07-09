"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import { ColoredSelect } from "@/components/ui/colored-select"
import { Spinner } from "@/components/ui/spinner"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldDescription } from "@/components/ui/field"
import { demandSchema, type DemandFormData } from "../schema/demand-schema"

const priorityOptions = [
  { value: "LOW", label: "Baixa", color: "#22c55e" },
  { value: "MEDIUM", label: "Média", color: "#f59e0b" },
  { value: "HIGH", label: "Alta", color: "#f97316" },
  { value: "URGENT", label: "Urgente", color: "#ef4444" },
]

const statusOptions = [
  { value: "PENDING", label: "Pendente", color: "#94a3b8" },
  { value: "IN_PROGRESS", label: "Em Andamento", color: "#3b82f6" },
  { value: "COMPLETED", label: "Concluída", color: "#22c55e" },
  { value: "ON_HOLD", label: "Em Espera", color: "#f59e0b" },
  { value: "CANCELLED", label: "Cancelada", color: "#ef4444" },
]

type DemandFormProps = {
  analysts: { id: string; name: string; color?: string }[]
  clients: { id: string; name: string; color?: string }[]
  requesters: { id: string; name: string }[]
  departments: { id: string; name: string }[]
  demandTypes: { id: string; name: string; color?: string }[]
  defaultValues?: Partial<DemandFormData> & { durationMinutes?: number }
  onSubmit: (data: DemandFormData) => void
  loading?: boolean
}

export function DemandForm({
  analysts,
  clients,
  requesters,
  departments,
  demandTypes,
  defaultValues,
  onSubmit,
  loading = false,
}: DemandFormProps) {
  const isEditing = !!defaultValues
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isDirty },
  } = useForm<DemandFormData>({
    resolver: zodResolver(demandSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      date: defaultValues?.date ?? new Date().toISOString().split("T")[0],
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      durationHours: defaultValues?.durationMinutes != null ? Math.floor(defaultValues.durationMinutes / 60) : 0,
      durationMinutes: defaultValues?.durationMinutes != null ? defaultValues.durationMinutes % 60 : 0,
      priority: defaultValues?.priority ?? "MEDIUM",
      status: defaultValues?.status ?? "PENDING",
      notes: defaultValues?.notes ?? "",
      analystId: defaultValues?.analystId ?? "",
      clientId: defaultValues?.clientId ?? "",
      requesterId: defaultValues?.requesterId ?? "",
      departmentId: defaultValues?.departmentId ?? "",
      demandTypeId: defaultValues?.demandTypeId ?? "",
    },
  })

  const analystOptions = analysts.map((a) => ({ value: a.id, label: a.name, color: a.color }))
  const clientOptions = clients.map((c) => ({ value: c.id, label: c.name, color: c.color }))
  const requesterOptions = requesters.map((r) => ({ value: r.id, label: r.name }))
  const departmentOptions = departments.map((d) => ({ value: d.id, label: d.name }))
  const demandTypeOptions = demandTypes.map((dt) => ({ value: dt.id, label: dt.name, color: dt.color }))

  const canSubmit = isValid && (!isEditing || isDirty)

  return (
    <DialogContent className="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar Demanda" : "Nova Demanda"}
        </DialogTitle>
        <DialogDescription>
          Preencha os dados da demanda abaixo.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 max-h-[75vh] overflow-y-auto overflow-x-hidden pr-1">
        <fieldset disabled={loading} className="contents">
        <Field>
          <Label>
            Nome da Demanda <span className="text-destructive">*</span>
          </Label>
          <Input aria-invalid={!!errors.name} {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field>
          <Label>
            Descrição <span className="text-destructive">*</span>
          </Label>
          <Textarea rows={3} aria-invalid={!!errors.description} {...register("description")} />
          <FieldError errors={[errors.description]} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field>
            <Label>
              Data <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value ? new Date(field.value + "T00:00:00") : undefined}
                  onChange={(date) => field.onChange(date ? date.toISOString().split("T")[0] : "")}
                  onBlur={field.onBlur}
                  disabled={loading}
                  aria-invalid={!!errors.date}
                />
              )}
            />
            <FieldError errors={[errors.date]} />
          </Field>
          <Field>
            <Label>
              Duração (HH:MM) <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                placeholder="00"
                className="w-full min-w-0 text-center"
                aria-invalid={!!(errors.durationHours ?? errors.durationMinutes)}
                {...register("durationHours", { valueAsNumber: true })}
              />
              <span className="text-muted-foreground shrink-0">:</span>
              <Input
                type="number"
                min="0"
                max="59"
                placeholder="00"
                className="w-full min-w-0 text-center"
                aria-invalid={!!(errors.durationHours ?? errors.durationMinutes)}
                {...register("durationMinutes", { valueAsNumber: true })}
              />
            </div>
            <FieldDescription>Informe valores inteiros de horas (HH) e minutos (MM)</FieldDescription>
            <FieldError errors={[errors.durationHours ?? errors.durationMinutes]} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field>
            <Label>
              Analista <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="analystId"
              control={control}
              render={({ field }) => (
                <ColoredSelect
                  options={analystOptions}
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={loading}
                  placeholder="Selecione"
                  className="w-full"
                  aria-invalid={!!errors.analystId}
                />
              )}
            />
            <FieldError errors={[errors.analystId]} />
          </Field>
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
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={loading}
                  placeholder="Selecione"
                  className="w-full"
                  aria-invalid={!!errors.clientId}
                />
              )}
            />
            <FieldError errors={[errors.clientId]} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Field>
            <Label>
              Solicitante <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="requesterId"
              control={control}
              render={({ field }) => (
                <ColoredSelect
                  options={requesterOptions}
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={loading}
                  placeholder="Selecione"
                  className="w-full"
                  aria-invalid={!!errors.requesterId}
                />
              )}
            />
            <FieldError errors={[errors.requesterId]} />
          </Field>
          <Field>
            <Label>
              Setor <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="departmentId"
              control={control}
              render={({ field }) => (
                <ColoredSelect
                  options={departmentOptions}
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={loading}
                  placeholder="Selecione"
                  className="w-full"
                  aria-invalid={!!errors.departmentId}
                />
              )}
            />
            <FieldError errors={[errors.departmentId]} />
          </Field>
          <Field>
            <Label>
              Tipo de Demanda <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="demandTypeId"
              control={control}
              render={({ field }) => (
                <ColoredSelect
                  options={demandTypeOptions}
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={loading}
                  placeholder="Selecione"
                  className="w-full"
                  aria-invalid={!!errors.demandTypeId}
                />
              )}
            />
            <FieldError errors={[errors.demandTypeId]} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field>
            <Label>
              Prioridade <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <ColoredSelect
                  options={priorityOptions}
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={loading}
                  placeholder="Selecione"
                  className="w-full"
                  aria-invalid={!!errors.priority}
                />
              )}
            />
            <FieldError errors={[errors.priority]} />
          </Field>
          <Field>
            <Label>
              Status <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <ColoredSelect
                  options={statusOptions}
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={loading}
                  placeholder="Selecione"
                  className="w-full"
                  aria-invalid={!!errors.status}
                />
              )}
            />
            <FieldError errors={[errors.status]} />
          </Field>
        </div>

        <Field>
          <Label>Observações</Label>
          <Textarea {...register("notes")} />
          <FieldError errors={[errors.notes]} />
        </Field>
        </fieldset>

        <DialogFooter className="bg-transparent border-t-0">
          <DialogClose render={<Button variant="outline" disabled={loading} />}>
            Cancelar
          </DialogClose>
          <Button type="submit" disabled={loading || !canSubmit}>
            {loading && <Spinner />}
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
