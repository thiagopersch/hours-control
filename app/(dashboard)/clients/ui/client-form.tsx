"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { clientSchema, type ClientFormData } from "../schema/client-schema"

type ClientFormProps = {
  defaultValues?: Partial<ClientFormData>
  onSubmit: (data: ClientFormData) => void
  loading?: boolean
}

export function ClientForm({
  defaultValues,
  onSubmit,
  loading,
}: ClientFormProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
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

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>
          {defaultValues?.name ? "Editar Cliente" : "Novo Cliente"}
        </DialogTitle>
        <DialogDescription>
          Preencha os dados do cliente abaixo.
        </DialogDescription>
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
            <Label>Razão Social</Label>
            <Input aria-invalid={!!errors.legalName} {...register("legalName")} />
            <FieldError errors={[errors.legalName]} />
          </Field>
          <Field>
            <Label>Documento (CPF/CNPJ)</Label>
            <Input aria-invalid={!!errors.document} {...register("document")} />
            <FieldError errors={[errors.document]} />
          </Field>
        </div>

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

        <Field>
          <Label>Responsável</Label>
          <Input aria-invalid={!!errors.responsible} {...register("responsible")} />
          <FieldError errors={[errors.responsible]} />
        </Field>

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

        <Field>
          <Label>Observações</Label>
          <Textarea {...register("notes")} />
          <FieldError errors={[errors.notes]} />
        </Field>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" onClick={() => reset()} />}>
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
