"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { PasswordInput } from "@/components/ui/password-input"
import { MultiSelect } from "@/components/ui/multi-select"
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
import { getUserSchema, type UserFormData } from "../schema/user-schema"

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
  loading = false,
}: UserFormProps) {
  const isEditing = !!defaultValues?.id
  const [showPassword, setShowPassword] = useState(!isEditing)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isValid, isDirty },
  } = useForm<UserFormData>({
    resolver: zodResolver(getUserSchema(isEditing)),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      status: "active",
      mustChangePassword: false,
      roleIds: [],
      ...defaultValues,
    },
  })

  const roleOptions = roles.map((role) => ({ value: role.id, label: role.name }))
  const canSubmit = isValid && (!isEditing || isDirty)

  function toggleShowPassword() {
    setShowPassword((prev) => {
      if (prev) setValue("password", "")
      return !prev
    })
  }

  return (
    <DialogContent className="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar Usuário" : "Novo Usuário"}
        </DialogTitle>
        <DialogDescription>Preencha os dados do usuário abaixo.</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <fieldset disabled={loading} className="contents">
        <div className="flex items-center gap-5">
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={field.value === "active"}
                  onCheckedChange={(checked: boolean) => field.onChange(checked ? "active" : "inactive")}
                  aria-invalid={!!errors.status}
                />
                Ativo
              </label>
            )}
          />
          <Controller
            name="mustChangePassword"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={!!field.value}
                  onCheckedChange={(checked: boolean) => field.onChange(checked)}
                />
                Alterar a senha no primeiro acesso
              </label>
            )}
          />
        </div>
        <FieldError errors={[errors.status]} />

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

        {isEditing && !showPassword && (
          <Button type="button" variant="outline" size="sm" onClick={toggleShowPassword}>
            Alterar senha
          </Button>
        )}

        {showPassword && (
          <Field>
            <div className="flex items-center justify-between">
              <Label>
                {isEditing ? "Nova Senha" : "Senha"} {!isEditing && <span className="text-destructive">*</span>}
              </Label>
              {isEditing && (
                <Button type="button" variant="ghost" size="sm" onClick={toggleShowPassword}>
                  Cancelar alteração
                </Button>
              )}
            </div>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <PasswordInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={loading}
                  aria-invalid={!!errors.password}
                  showStrength
                />
              )}
            />
            <FieldError errors={[errors.password]} />
          </Field>
        )}

        <Field>
          <Label>
            Perfis <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="roleIds"
            control={control}
            render={({ field }) => (
              <MultiSelect
                options={roleOptions}
                value={field.value ?? []}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                disabled={loading}
                placeholder="Selecione os perfis"
                aria-invalid={!!errors.roleIds}
              />
            )}
          />
          <FieldError errors={[errors.roleIds]} />
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
