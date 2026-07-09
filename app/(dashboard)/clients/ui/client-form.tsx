"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "@/components/ui/phone-input"
import { DocumentInput } from "@/components/ui/document-input"
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
import { clientSchema, type ClientFormData } from "../schema/client-schema"

const statusOptions = [
  { value: "active", label: "Ativo", color: "#22c55e" },
  { value: "inactive", label: "Inativo", color: "#6b7280" },
]

type ClientFormProps = {
  defaultValues?: Partial<ClientFormData>
  onSubmit: (data: ClientFormData) => void
  loading?: boolean
}

export function ClientForm({
  defaultValues,
  onSubmit,
  loading = false,
}: ClientFormProps) {
  const isEditing = !!defaultValues
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      legalName: "",
      document: "",
      email: "",
      phone: "",
      responsible: "",
      color: "#6b7280",
      notes: "",
      status: "active",
      ...defaultValues,
    },
  })

  const canSubmit = isValid && (!isEditing || isDirty)

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar Cliente" : "Novo Cliente"}
        </DialogTitle>
        <DialogDescription>
          Preencha os dados do cliente abaixo.
        </DialogDescription>
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
            <Label>Razão Social</Label>
            <Input aria-invalid={!!errors.legalName} {...register("legalName")} />
            <FieldError errors={[errors.legalName]} />
          </Field>
          <Field>
            <Label>Documento (CPF/CNPJ)</Label>
            <Controller
              name="document"
              control={control}
              render={({ field }) => (
                <DocumentInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={loading}
                  aria-invalid={!!errors.document}
                />
              )}
            />
            <FieldError errors={[errors.document]} />
          </Field>
        </div>

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

        <Field>
          <Label>Responsável</Label>
          <Input aria-invalid={!!errors.responsible} {...register("responsible")} />
          <FieldError errors={[errors.responsible]} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field>
            <Label>Cor</Label>
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

        <Field>
          <Label>Observações</Label>
          <Textarea {...register("notes")} />
          <FieldError errors={[errors.notes]} />
        </Field>
        </fieldset>

        <DialogFooter>
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
