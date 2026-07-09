"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { organizationSchema, type OrganizationFormData } from "../schema/organization-schema"

const planOptions = [
  { value: "free", label: "Free", color: "#6b7280" },
  { value: "pro", label: "Pro", color: "#3b82f6" },
  { value: "enterprise", label: "Enterprise", color: "#22c55e" },
]

const statusOptions = [
  { value: "active", label: "Ativo", color: "#22c55e" },
  { value: "inactive", label: "Inativo", color: "#6b7280" },
]

type OrganizationFormProps = {
  defaultValues?: Partial<OrganizationFormData>
  onSubmit: (data: OrganizationFormData) => void
  loading?: boolean
}

export function OrganizationForm({
  defaultValues,
  onSubmit,
  loading = false,
}: OrganizationFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      slug: "",
      document: "",
      plan: "free",
      status: "active",
      ...defaultValues,
    },
  })

  const canSubmit = isValid && isDirty

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Editar Organização</DialogTitle>
        <DialogDescription>Atualize os dados da organização abaixo.</DialogDescription>
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
              Slug <span className="text-destructive">*</span>
            </Label>
            <Input aria-invalid={!!errors.slug} {...register("slug")} />
            <FieldError errors={[errors.slug]} />
          </Field>
          <Field>
            <Label>Documento (CPF/CNPJ)</Label>
            <Input aria-invalid={!!errors.document} {...register("document")} />
            <FieldError errors={[errors.document]} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field>
            <Label>
              Plano <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="plan"
              control={control}
              render={({ field }) => (
                <ColoredSelect
                  options={planOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={loading}
                  placeholder="Selecione..."
                  className="w-full"
                  aria-invalid={!!errors.plan}
                />
              )}
            />
            <FieldError errors={[errors.plan]} />
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
