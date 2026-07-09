"use client"

import { useState } from "react"

export function useCrudModal<T>() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  // Bumped on every open so the form remounts (and resets) even when
  // reopening the same record after a Cancel/X left it dirty.
  const [sessionId, setSessionId] = useState(0)

  function openCreate() {
    setEditing(null)
    setOpen(true)
    setSessionId((id) => id + 1)
  }

  function openEdit(item: T) {
    setEditing(item)
    setOpen(true)
    setSessionId((id) => id + 1)
  }

  function close() {
    setOpen(false)
  }

  function toggle() {
    setOpen((prev) => !prev)
  }

  return {
    open,
    editing,
    sessionId,
    openCreate,
    openEdit,
    close,
    toggle,
    onOpenChange: (next: boolean) => (next ? openCreate() : close()),
  }
}
