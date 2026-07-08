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
import { Checkbox } from "@/components/ui/checkbox"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Field, FieldError } from "@/components/ui/field"
import { userSchema, type UserFormData } from "../schema/user-schema"

type UserFormProps = {
  roles: { id: string; name: string }[]
  defaultValues?: Partial<UserFormData> & { id?: string }
  onSubmit: (data: UserFormData) => void
  loading?: boolean
}

export function UserForm({
  roles,
  defaultValues,
  onSubmit,
  loading,
}: UserFormProps) {
  const isEditing = !!defaultValues?.id

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      status: "active",
      roleIds: [],
      ...defaultValues,
    },
  })

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar Usuário" : "Novo Usuário"}
        </DialogTitle>
        <DialogDescription>Preencha os dados do usuário abaixo.</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field>
          <Label>
            Nome <span className="text-destructive">*</span>
          </Label>
          <Input aria-invalid={!!errors.name} {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field>
          <Label>
            Email <span className="text-destructive">*</span>
          </Label>
          <Input type="email" aria-invalid={!!errors.email} {...register("email")} />
          <FieldError errors={[errors.email]} />
        </Field>

        {!isEditing && (
          <Field>
            <Label>
              Senha <span className="text-destructive">*</span>
            </Label>
            <Input type="password" aria-invalid={!!errors.password} {...register("password")} />
            <FieldError errors={[errors.password]} />
          </Field>
        )}

        {isEditing && (
          <Field>
            <Label>Nova Senha (deixe em branco para manter)</Label>
            <Input type="password" aria-invalid={!!errors.password} {...register("password")} />
            <FieldError errors={[errors.password]} />
          </Field>
        )}

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

        <Field>
          <Label>Perfis</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {roles.map((role) => {
              const watchedRoleIds = watch("roleIds") ?? []
              return (
                <label
                  key={role.id}
                  className="flex items-center gap-1.5 text-sm cursor-pointer"
                >
                  <Checkbox
                    checked={watchedRoleIds.includes(role.id)}
                    onCheckedChange={(checked: boolean) => {
                      if (checked) {
                        setValue("roleIds", [...watchedRoleIds, role.id])
                      } else {
                        setValue("roleIds", watchedRoleIds.filter((id: string) => id !== role.id))
                      }
                    }}
                  />
                  {role.name}
                </label>
              )
            })}
          </div>
          <FieldError errors={[errors.roleIds]} />
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
