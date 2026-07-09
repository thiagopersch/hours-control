"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronDown, ChevronsDownUp, ChevronsUpDown, CheckSquare, Square, SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
import { normalizeForSearch } from "@/lib/search"
import { moduleLabel } from "@/lib/module-labels"

type PermissionGroup = {
  resource: string
  permissions: { id: string; action: string; description: string }[]
}

const actionLabels: Record<string, string> = {
  read: "Visualizar",
  create: "Criar",
  update: "Editar",
  delete: "Excluir",
}

const actionOrder = ["read", "create", "update", "delete"]

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
  loading = false,
}: RoleFormProps) {
  const isEditing = !!defaultValues
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      permissionIds: [],
      ...defaultValues,
    },
  })

  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(permissionGroups.map((g) => g.resource))
  )

  const sortedGroups = useMemo(
    () => [...permissionGroups].sort((a, b) => moduleLabel(a.resource).localeCompare(moduleLabel(b.resource), "pt-BR")),
    [permissionGroups]
  )

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return sortedGroups
    const normalizedSearch = normalizeForSearch(search)
    return sortedGroups.filter((g) => normalizeForSearch(moduleLabel(g.resource)).includes(normalizedSearch))
  }, [sortedGroups, search])

  const allPermissionIds = useMemo(
    () => permissionGroups.flatMap((g) => g.permissions.map((p) => p.id)),
    [permissionGroups]
  )

  const watchedIds = watch("permissionIds") ?? []
  const canSubmit = isValid && (!isEditing || isDirty)

  function checkAll() {
    setValue("permissionIds", allPermissionIds, { shouldValidate: true, shouldDirty: true })
  }

  function uncheckAll() {
    setValue("permissionIds", [], { shouldValidate: true, shouldDirty: true })
  }

  function expandAll() {
    setExpanded(new Set(permissionGroups.map((g) => g.resource)))
  }

  function collapseAll() {
    setExpanded(new Set())
  }

  function togglePermission(id: string, checked: boolean) {
    if (checked) {
      setValue("permissionIds", [...watchedIds, id], { shouldValidate: true, shouldDirty: true })
    } else {
      setValue("permissionIds", watchedIds.filter((pid: string) => pid !== id), { shouldValidate: true, shouldDirty: true })
    }
  }

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar Perfil" : "Novo Perfil"}
        </DialogTitle>
        <DialogDescription>Preencha os dados do perfil abaixo.</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 max-h-[80vh] overflow-y-auto overflow-x-hidden pr-1">
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

        <FieldSet>
          <FieldLegend>Permissões</FieldLegend>

          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar módulo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={checkAll}>
              <CheckSquare className="size-3.5" /> Marcar todos
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={uncheckAll}>
              <Square className="size-3.5" /> Desmarcar todos
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={expandAll}>
              <ChevronsUpDown className="size-3.5" /> Expandir todos
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={collapseAll}>
              <ChevronsDownUp className="size-3.5" /> Recolher todos
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-1 rounded-lg border p-2">
            {filteredGroups.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum módulo encontrado.</p>
            )}
            {filteredGroups.map((group) => {
              const sortedPermissions = [...group.permissions].sort(
                (a, b) => actionOrder.indexOf(a.action) - actionOrder.indexOf(b.action)
              )
              const isOpen = expanded.has(group.resource)
              return (
                <Collapsible
                  key={group.resource}
                  open={isOpen}
                  onOpenChange={(open) => {
                    setExpanded((prev) => {
                      const next = new Set(prev)
                      if (open) next.add(group.resource)
                      else next.delete(group.resource)
                      return next
                    })
                  }}
                >
                  <CollapsibleTrigger
                    type="button"
                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent"
                  >
                    {moduleLabel(group.resource)}
                    <ChevronDown className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="flex flex-wrap gap-3 pl-4 py-1.5">
                      {sortedPermissions.map((perm) => (
                        <label
                          key={perm.id}
                          className="flex items-center gap-1.5 text-sm cursor-pointer"
                        >
                          <Checkbox
                            checked={watchedIds.includes(perm.id)}
                            onCheckedChange={(checked: boolean) => togglePermission(perm.id, checked)}
                          />
                          {actionLabels[perm.action] ?? perm.action}
                        </label>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </div>
          <FieldError errors={[errors.permissionIds]} />
        </FieldSet>
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
