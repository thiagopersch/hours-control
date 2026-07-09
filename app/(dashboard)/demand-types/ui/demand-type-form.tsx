"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { demandTypeSchema, DemandTypeFormData } from "../schema/demand-type-schema"

type DemandTypeFormProps = {
  defaultValues?: Partial<DemandTypeFormData>
  onSubmit: (data: DemandTypeFormData) => void
  loading?: boolean
}

export function DemandTypeForm({
  defaultValues,
  onSubmit,
  loading = false,
}: DemandTypeFormProps) {
  const isEditing = !!defaultValues
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<DemandTypeFormData>({
    resolver: zodResolver(demandTypeSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      color: "#6b7280",
      ...defaultValues,
    },
  })

  const colorValue = watch("color")
  const canSubmit = isValid && (!isEditing || isDirty)

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar Tipo de Demanda" : "Novo Tipo de Demanda"}
        </DialogTitle>
        <DialogDescription>Preencha os dados do tipo de demanda abaixo.</DialogDescription>
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

        <Field>
          <Label>Descrição</Label>
          <Textarea aria-invalid={!!errors.description} {...register("description")} />
          <FieldError errors={[errors.description]} />
        </Field>

        <Field>
          <Label>Cor</Label>
          <div className="flex items-center gap-2">
            <Input type="color" aria-invalid={!!errors.color} {...register("color")} className="h-8 w-[30%] p-1" />
            <span className="text-sm text-muted-foreground">{colorValue}</span>
          </div>
          <FieldError errors={[errors.color]} />
        </Field>
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
