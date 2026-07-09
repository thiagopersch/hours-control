import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { hash } from "@node-rs/argon2"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { passwordSchema } from "@/lib/validators"

const changePasswordSchema = z.object({
  password: passwordSchema(true),
})

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const parsed = changePasswordSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const passwordHash = await hash(parsed.data.password)

  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash, mustChangePassword: false },
  })

  return NextResponse.json({ success: true })
}
