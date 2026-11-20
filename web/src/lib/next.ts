/** Only same-site paths are allowed as a "go here after login" target. Blocks open redirects. */
export function safeNext(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return null
  return value
}
