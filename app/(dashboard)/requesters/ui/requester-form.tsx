"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { requesterSchema, RequesterFormData } from "../schema/requester-schema"

type RequesterFormProps = {
  defaultValues?: Partial<RequesterFormData>
  onSubmit: (data: RequesterFormData) => void
  loading?: boolean
}

export function RequesterForm({
  defaultValues,
  onSubmit,
  loading,
}: RequesterFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<RequesterFormData>({
    resolver: zodResolver(requesterSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      status: "active",
      ...defaultValues,
    },
  })

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>
          {defaultValues?.name ? "Editar Solicitante" : "Novo Solicitante"}
        </DialogTitle>
        <DialogDescription>Preencha os dados do solicitante abaixo.</DialogDescription>
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
            <Label>
              Email <span className="text-destructive">*</span>
            </Label>
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
          <Label>Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? "active"}
                onValueChange={(val) => {
                  if (val !== null) field.onChange(val)
                }}
              >
                <SelectTrigger className="w-full" aria-invalid={!!errors.status}>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    <span className="inline-block size-2 rounded-full bg-emerald-500" />
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
