"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Field, FieldError } from "@/components/ui/field"
import { analystSchema, MAX_ANALYST_LEVEL, type AnalystFormData } from "../schema/analyst-schema"

const levelOptions = Array.from({ length: MAX_ANALYST_LEVEL }, (_, i) => i + 1)

type AnalystFormProps = {
  defaultValues?: Partial<AnalystFormData>
  onSubmit: (data: AnalystFormData) => void
  loading?: boolean
}

export function AnalystForm({
  defaultValues,
  onSubmit,
  loading,
}: AnalystFormProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnalystFormData>({
    resolver: zodResolver(analystSchema),
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

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>
          {defaultValues?.name ? "Editar Analista" : "Novo Analista"}
        </DialogTitle>
        <DialogDescription>Preencha os dados do analista abaixo.</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field>
          <Label>
            Nome <span className="text-destructive">*</span>
          </Label>
          <Input aria-invalid={!!errors.name} {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <Label>Email</Label>
            <Input type="email" aria-invalid={!!errors.email} {...register("email")} />
            <FieldError errors={[errors.email]} />
          </Field>
          <Field>
            <Label>Telefone</Label>
            <Input aria-invalid={!!errors.phone} {...register("phone")} />
            <FieldError errors={[errors.phone]} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <Label>Cargo</Label>
            <Input aria-invalid={!!errors.role} {...register("role")} />
            <FieldError errors={[errors.role]} />
          </Field>
          <Field>
            <Label>Valor Hora (R$)</Label>
            <Input type="number" step="0.01" aria-invalid={!!errors.hourlyRate} {...register("hourlyRate", { valueAsNumber: true })} />
            <FieldError errors={[errors.hourlyRate]} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <Label>Equipe</Label>
            <Input aria-invalid={!!errors.team} {...register("team")} />
            <FieldError errors={[errors.team]} />
          </Field>
          <Field>
            <Label>Nível</Label>
            <Controller
              name="level"
              control={control}
              render={({ field }) => (
                <Select
                  value={String(field.value)}
                  onValueChange={(val) => {
                    if (val !== null) field.onChange(Number(val))
                  }}
                >
                  <SelectTrigger className="w-full" aria-invalid={!!errors.level}>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {levelOptions.map((level) => (
                      <SelectItem key={level} value={String(level)}>
                        Nível {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.level]} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field>
            <Label>Cor</Label>
            <Input type="color" aria-invalid={!!errors.color} {...register("color")} className="h-8 p-1" />
            <FieldError errors={[errors.color]} />
          </Field>
          <Field>
            <Label>Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    if (val !== null) field.onChange(val)
                  }}
                >
                  <SelectTrigger className="w-full" aria-invalid={!!errors.status}>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      <span className="inline-block size-2 rounded-full bg-green-500" />
                      Ativo
                    </SelectItem>
                    <SelectItem value="inactive">
                      <span className="inline-block size-2 rounded-full bg-gray-400" />
                      Inativo
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.status]} />
          </Field>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" onClick={() => reset()} />}>Cancelar</DialogClose>
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
