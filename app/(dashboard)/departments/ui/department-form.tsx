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
import { departmentSchema, DepartmentFormData } from "../schema/department-schema"

type DepartmentFormProps = {
  defaultValues?: Partial<DepartmentFormData>
  onSubmit: (data: DepartmentFormData) => void
  loading?: boolean
}

export function DepartmentForm({
  defaultValues,
  onSubmit,
  loading = false,
}: DepartmentFormProps) {
  const isEditing = !!defaultValues
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      ...defaultValues,
    },
  })

  const canSubmit = isValid && (!isEditing || isDirty)

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar Setor" : "Novo Setor"}
        </DialogTitle>
        <DialogDescription>Preencha os dados do setor abaixo.</DialogDescription>
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
