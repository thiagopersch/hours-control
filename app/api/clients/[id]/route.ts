import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const { id } = await params
  const client = await prisma.client.findFirst({
    where: { id, organizationId, deletedAt: null },
  })

  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 })

  return NextResponse.json(client)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const { id } = await params
  const existing = await prisma.client.findFirst({
    where: { id, organizationId, deletedAt: null },
  })

  if (!existing) return NextResponse.json({ error: "Client not found" }, { status: 404 })

  const body = await request.json()
  const client = await prisma.client.update({
    where: { id },
    data: body,
  })

  return NextResponse.json(client)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const { id } = await params
  const existing = await prisma.client.findFirst({
    where: { id, organizationId, deletedAt: null },
  })

  if (!existing) return NextResponse.json({ error: "Client not found" }, { status: 404 })

  await prisma.client.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ message: "Client deleted" })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const organizationId = request.headers.get("X-Organization-Id")
  if (!organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 })

  const { id } = await params
  const existing = await prisma.client.findFirst({
    where: { id, organizationId, deletedAt: null },
  })

  if (!existing) return NextResponse.json({ error: "Client not found" }, { status: 404 })

  const body = await request.json()
  const client = await prisma.client.update({
    where: { id },
    data: body,
  })

  return NextResponse.json(client)
}
