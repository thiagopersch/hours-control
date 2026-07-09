"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "@/components/ui/phone-input"
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
import { Field, FieldError } from "@/components/ui/field"
import { analystSchema, MAX_ANALYST_LEVEL, type AnalystFormData } from "../schema/analyst-schema"

const levelOptions = Array.from({ length: MAX_ANALYST_LEVEL }, (_, i) => ({
  value: String(i + 1),
  label: `Nível ${i + 1}`,
}))

const statusOptions = [
  { value: "active", label: "Ativo", color: "#22c55e" },
  { value: "inactive", label: "Inativo", color: "#6b7280" },
]

type AnalystFormProps = {
  defaultValues?: Partial<AnalystFormData>
  onSubmit: (data: AnalystFormData) => void
  loading?: boolean
}

export function AnalystForm({
  defaultValues,
  onSubmit,
  loading = false,
}: AnalystFormProps) {
  const isEditing = !!defaultValues
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<AnalystFormData>({
    resolver: zodResolver(analystSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
      hourlyRate: 0,
      team: "",
      color: "#6b7280",
      level: 1,
      status: "active",
      ...defaultValues,
    },
  })

  const canSubmit = isValid && (!isEditing || isDirty)

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar Analista" : "Novo Analista"}
        </DialogTitle>
        <DialogDescription>Preencha os dados do analista abaixo.</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <fieldset disabled={loading} className="contents">
        <Field>
          <Label>
            Nome <span className="text-destructive">*</span>
          </Label>
          <Input aria-invalid={!!errors.name} {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field>
            <Label>Email</Label>
            <Input type="email" aria-invalid={!!errors.email} {...register("email")} />
            <FieldError errors={[errors.email]} />
          </Field>
          <Field>
            <Label>Telefone</Label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={loading}
                  aria-invalid={!!errors.phone}
                />
              )}
            />
            <FieldError errors={[errors.phone]} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field>
            <Label>Cargo</Label>
            <Input aria-invalid={!!errors.role} {...register("role")} />
            <FieldError errors={[errors.role]} />
          </Field>
          <Field>
            <Label>
              Valor Hora (R$) <span className="text-destructive">*</span>
            </Label>
            <Input type="number" step="0.01" aria-invalid={!!errors.hourlyRate} {...register("hourlyRate", { valueAsNumber: true })} />
            <FieldError errors={[errors.hourlyRate]} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field>
            <Label>Equipe</Label>
            <Input aria-invalid={!!errors.team} {...register("team")} />
            <FieldError errors={[errors.team]} />
          </Field>
          <Field>
            <Label>
              Nível <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="level"
              control={control}
              render={({ field }) => (
                <ColoredSelect
                  options={levelOptions}
                  value={String(field.value)}
                  onValueChange={(val) => field.onChange(Number(val))}
                  onBlur={field.onBlur}
                  disabled={loading}
                  placeholder="Selecione..."
                  className="w-full"
                  aria-invalid={!!errors.level}
                />
              )}
            />
            <FieldError errors={[errors.level]} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field>
            <Label>
              Cor <span className="text-destructive">*</span>
            </Label>
            <Input type="color" aria-invalid={!!errors.color} {...register("color")} className="h-8 p-1" />
            <FieldError errors={[errors.color]} />
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
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={loading}
                  placeholder="Selecione..."
                  className="w-full"
                  aria-invalid={!!errors.status}
                />
              )}
            />
            <FieldError errors={[errors.status]} />
          </Field>
        </div>
        </fieldset>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={loading} />}>Cancelar</DialogClose>
          <Button type="submit" disabled={loading || !canSubmit}>
            {loading && <Spinner />}
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
