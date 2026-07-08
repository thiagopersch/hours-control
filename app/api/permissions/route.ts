import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const permissions = await prisma.permission.findMany({
    orderBy: [{ resource: "asc" }, { action: "asc" }],
  })

  const grouped = new Map<string, { resource: string; permissions: typeof permissions }>()
  for (const permission of permissions) {
    const group = grouped.get(permission.resource)
    if (group) {
      group.permissions.push(permission)
    } else {
      grouped.set(permission.resource, { resource: permission.resource, permissions: [permission] })
    }
  }

  return NextResponse.json(Array.from(grouped.values()))
}
