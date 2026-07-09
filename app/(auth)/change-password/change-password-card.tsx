"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { PasswordInput } from "@/components/ui/password-input"
import { Spinner } from "@/components/ui/spinner"
import { apiMutate, FetchError } from "@/lib/fetcher"
import { passwordSchema } from "@/lib/validators"
import { flattenNavItems } from "@/lib/nav-items"
import { hasPermission } from "@/lib/permissions"

const changePasswordSchema = z
  .object({
    password: passwordSchema(true),
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

type ChangePasswordValues = z.infer<typeof changePasswordSchema>

export function ChangePasswordCard() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [loading, setLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  })

  async function onSubmit(values: ChangePasswordValues) {
    setLoading(true)
    try {
      await apiMutate("/api/users/change-password", {
        method: "POST",
        body: JSON.stringify({ password: values.password }),
      })

      await update({ mustChangePassword: false })

      const permissions = (session?.user as any)?.permissions as string[] | undefined
      const target =
        flattenNavItems().find(
          (item) => item.resource && hasPermission(permissions, item.resource)
        )?.href ?? "/dashboard"

      toast.success("Senha alterada com sucesso!")
      router.push(target)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Erro ao alterar senha")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Alterar Senha</CardTitle>
        <CardDescription>
          Por segurança, defina uma nova senha antes de continuar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <fieldset disabled={loading} className="contents">
          <Field>
            <FieldLabel>Nova Senha</FieldLabel>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <PasswordInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-invalid={!!errors.password}
                  showStrength
                />
              )}
            />
            <FieldError errors={[errors.password]} />
          </Field>

          <Field>
            <FieldLabel>Confirmar Nova Senha</FieldLabel>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <PasswordInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-invalid={!!errors.confirmPassword}
                />
              )}
            />
            <FieldError errors={[errors.confirmPassword]} />
          </Field>
          </fieldset>

          <Button type="submit" className="w-full" disabled={loading || !isValid}>
            {loading && <Spinner />}
            {loading ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
