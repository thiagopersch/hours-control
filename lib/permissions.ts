export function hasPermission(
  permissions: string[] | undefined | null,
  resource: string,
  action: string = "read"
): boolean {
  if (!permissions) return false
  return permissions.includes(`${resource}:${action}`)
}
