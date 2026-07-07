"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldSet, FieldLegend } from "@/components/ui/field"
import { roleSchema, type RoleFormData } from "../schema/role-schema"

type PermissionGroup = {
  resource: string
  permissions: { id: string; name: string; description: string }[]
}

type RoleFormProps = {
  permissionGroups: PermissionGroup[]
  defaultValues?: Partial<RoleFormData>
  onSubmit: (data: RoleFormData) => void
  loading?: boolean
}

export function RoleForm({
  permissionGroups,
  defaultValues,
  onSubmit,
  loading,
}: RoleFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
      permissionIds: [],
      ...defaultValues,
    },
  })

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>
          {defaultValues?.name ? "Editar Perfil" : "Novo Perfil"}
        </DialogTitle>
        <DialogDescription>Preencha os dados do perfil abaixo.</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field>
          <Label>
            Nome <span className="text-destructive">*</span>
          </Label>
          <Input {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field>
          <Label>Descrição</Label>
          <Textarea {...register("description")} />
          <FieldError errors={[errors.description]} />
        </Field>

        <FieldSet>
          <FieldLegend>Permissões</FieldLegend>
          <div className="max-h-64 overflow-y-auto space-y-3">
            {permissionGroups.map((group) => (
              <div key={group.resource}>
                <p className="text-sm font-medium text-foreground mb-1 capitalize">
                  {group.resource}
                </p>
                <div className="flex flex-wrap gap-3 pl-2">
                  {group.permissions.map((perm) => {
                    const watchedIds = watch("permissionIds") || []
                    return (
                      <label
                        key={perm.id}
                        className="flex items-center gap-1.5 text-sm cursor-pointer"
                      >
                        <Checkbox
                          checked={watchedIds.includes(perm.id)}
                          onCheckedChange={(checked: boolean) => {
                            if (checked) {
                              setValue("permissionIds", [...watchedIds, perm.id])
                            } else {
                              setValue("permissionIds", watchedIds.filter((id: string) => id !== perm.id))
                            }
                          }}
                        />
                        <span>{perm.name}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <FieldError errors={[errors.permissionIds]} />
        </FieldSet>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
