import { beginRequest, endRequest } from "@/lib/loading-store"

export class FetchError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function fetcher<T = unknown>(url: string): Promise<T> {
  beginRequest()
  try {
    const res = await fetch(url)
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }))
      throw new FetchError(body.error ?? res.statusText, res.status)
    }
    return await res.json()
  } finally {
    endRequest()
  }
}

export async function apiMutate<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new FetchError(body.error ?? res.statusText, res.status)
  }
  return res.json()
}
