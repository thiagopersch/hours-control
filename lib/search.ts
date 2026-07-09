const COMBINING_DIACRITIC_MIN = 0x0300
const COMBINING_DIACRITIC_MAX = 0x036f

export function toSearchableString(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  if (value instanceof Date) return value.toISOString()
  return ""
}

export function normalizeForSearch(value: unknown): string {
  let withoutDiacritics = ""
  for (const char of toSearchableString(value).normalize("NFD")) {
    const code = char.codePointAt(0) ?? 0
    if (code >= COMBINING_DIACRITIC_MIN && code <= COMBINING_DIACRITIC_MAX) continue
    withoutDiacritics += char
  }
  return withoutDiacritics.toLowerCase().replace(/[^a-z0-9]+/g, "")
}
