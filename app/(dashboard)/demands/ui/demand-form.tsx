"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

type DemandFormProps = {
  analysts: { id: string; name: string }[]
  clients: { id: string; name: string }[]
  requesters: { id: string; name: string }[]
  departments: { id: string; name: string }[]
  demandTypes: { id: string; name: string }[]
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
  loading,
}: DemandFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DemandFormData>({
    resolver: zodResolver(demandSchema),
    defaultValues: {
      date: defaultValues?.date ?? new Date().toISOString().split("T")[0],
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      durationHours: defaultValues?.durationMinutes != null ? Math.floor(defaultValues.durationMinutes / 60) : 0,
      durationMinutes: defaultValues?.durationMinutes != null ? defaultValues.durationMinutes % 60 : 0,
      priority: defaultValues?.priority ?? "medium",
      status: defaultValues?.status ?? "open",
      notes: defaultValues?.notes ?? "",
      analystId: defaultValues?.analystId ?? "",
      clientId: defaultValues?.clientId ?? "",
      requesterId: defaultValues?.requesterId ?? "",
      departmentId: defaultValues?.departmentId ?? "",
      demandTypeId: defaultValues?.demandTypeId ?? "",
    },
  })

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {defaultValues?.name ? "Editar Demanda" : "Nova Demanda"}
        </DialogTitle>
        <DialogDescription>
          Preencha os dados da demanda abaixo.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <Field>
          <Label>
            Nome da Demanda <span className="text-destructive">*</span>
          </Label>
          <Input {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field>
          <Label>
            Descrição <span className="text-destructive">*</span>
          </Label>
          <Textarea rows={3} {...register("description")} />
          <FieldError errors={[errors.description]} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
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
                />
              )}
            />
            <FieldError errors={[errors.date]} />
          </Field>
          <Field>
            <Label>Duração (HH:MM)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                placeholder="00"
                className="w-20 text-center"
                {...register("durationHours", { valueAsNumber: true })}
              />
              <span className="text-muted-foreground">:</span>
              <Input
                type="number"
                min="0"
                max="59"
                placeholder="00"
                className="w-20 text-center"
                {...register("durationMinutes", { valueAsNumber: true })}
              />
            </div>
            <FieldDescription>Informe o tempo em horas e minutos</FieldDescription>
            <FieldError errors={[errors.durationHours || errors.durationMinutes]} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <Label>
              Analista <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="analystId"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {analysts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.clientId]} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <Label>Solicitante</Label>
            <Controller
              name="requesterId"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {requesters.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.requesterId]} />
          </Field>
          <Field>
            <Label>Setor</Label>
            <Controller
              name="departmentId"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.departmentId]} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <Label>Tipo de Demanda</Label>
            <Controller
              name="demandTypeId"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {demandTypes.map((dt) => (
                      <SelectItem key={dt.id} value={dt.id}>
                        {dt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.demandTypeId]} />
          </Field>
          <Field>
            <Label>Prioridade</Label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <span className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-green-500" />
                        Baixa
                      </span>
                    </SelectItem>
                    <SelectItem value="medium">
                      <span className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-amber-500" />
                        Média
                      </span>
                    </SelectItem>
                    <SelectItem value="high">
                      <span className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-orange-500" />
                        Alta
                      </span>
                    </SelectItem>
                    <SelectItem value="urgent">
                      <span className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-red-500" />
                        Urgente
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.priority]} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <Label>Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">
                      <span className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-slate-400" />
                        Aberta
                      </span>
                    </SelectItem>
                    <SelectItem value="in_progress">
                      <span className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-blue-500" />
                        Em Andamento
                      </span>
                    </SelectItem>
                    <SelectItem value="resolved">
                      <span className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-green-500" />
                        Resolvida
                      </span>
                    </SelectItem>
                    <SelectItem value="closed">
                      <span className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-slate-400" />
                        Fechada
                      </span>
                    </SelectItem>
                    <SelectItem value="cancelled">
                      <span className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-red-500" />
                        Cancelada
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
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

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancelar
          </DialogClose>
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
