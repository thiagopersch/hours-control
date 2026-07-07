import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { SessionProvider } from "./session-provider"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <SessionProvider session={session}>
      <AppLayout>{children}</AppLayout>
    </SessionProvider>
  )
}
