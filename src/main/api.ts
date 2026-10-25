import { getConfig } from './config'
import { clearSession, getToken } from './session'

export type ApiRequest = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  path: string
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
}

export type ApiResult = {
  ok: boolean
  status: number
  networkError: boolean
  body: unknown
}

const TIMEOUT_MS = 15000

export async function request(req: ApiRequest): Promise<ApiResult> {
  const url = new URL(getConfig().apiUrl + req.path)
  Object.entries(req.query ?? {}).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value))
  })

  const headers: Record<string, string> = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (req.body !== undefined) headers['Content-Type'] = 'application/json'

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: req.method,
      headers,
      body: req.body !== undefined ? JSON.stringify(req.body) : undefined,
      signal: controller.signal
    })

    const text = await response.text()
    let body: unknown = null
    try {
      body = text ? JSON.parse(text) : null
    } catch {
      body = null
    }

    // Jeton refusé par le serveur : la session est terminée
    if (response.status === 401 && token) clearSession()

    return { ok: response.ok, status: response.status, networkError: false, body }
  } catch {
    // Serveur injoignable ou délai dépassé
    return { ok: false, status: 0, networkError: true, body: null }
  } finally {
    clearTimeout(timer)
  }
}