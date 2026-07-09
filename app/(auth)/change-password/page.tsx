import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { SessionProvider } from "@/app/(dashboard)/session-provider"
import { ChangePasswordCard } from "./change-password-card"

export default async function ChangePasswordPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <SessionProvider session={session}>
      <ChangePasswordCard />
    </SessionProvider>
  )
}
