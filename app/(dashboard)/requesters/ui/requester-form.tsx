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
import { requesterSchema, RequesterFormData } from "../schema/requester-schema"

const statusOptions = [
  { value: "active", label: "Ativo", color: "#10b981" },
  { value: "inactive", label: "Inativo", color: "#6b7280" },
]

type RequesterFormProps = {
  defaultValues?: Partial<RequesterFormData>
  onSubmit: (data: RequesterFormData) => void
  loading?: boolean
}

export function RequesterForm({
  defaultValues,
  onSubmit,
  loading = false,
}: RequesterFormProps) {
  const isEditing = !!defaultValues
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isDirty },
  } = useForm<RequesterFormData>({
    resolver: zodResolver(requesterSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      status: "active",
      ...defaultValues,
    },
  })

  const canSubmit = isValid && (!isEditing || isDirty)

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar Solicitante" : "Novo Solicitante"}
        </DialogTitle>
        <DialogDescription>Preencha os dados do solicitante abaixo.</DialogDescription>
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
            <Label>
              Email <span className="text-destructive">*</span>
            </Label>
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
                value={field.value ?? "active"}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                disabled={loading}
                placeholder="Selecione o status"
                className="w-full"
                aria-invalid={!!errors.status}
              />
            )}
          />
          <FieldError errors={[errors.status]} />
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
