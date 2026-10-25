type Session = { token: string; user: unknown; permissions: string[] }

let session: Session | null = null

export function setSession(value: Session): void {
  session = value
}

export function getToken(): string | null {
  return session?.token ?? null
}

// Ce que la page a le droit de voir : jamais le jeton
export function getPublicSession(): { user: unknown; permissions: string[] } | null {
  return session ? { user: session.user, permissions: session.permissions } : null
}

export function clearSession(): void {
  session = null
}