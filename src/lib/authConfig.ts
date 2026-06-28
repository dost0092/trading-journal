export const SUPERADMIN_EMAILS = [
  'waqasdostdost0092@gmail.com',
  'waqaskhan.dost0092@gmail.com',
] as const

export function isSuperAdminEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase()
  return (SUPERADMIN_EMAILS as readonly string[]).includes(normalized)
}
