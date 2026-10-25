import { app } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

type AppConfig = { apiUrl: string }

// À adapter : adresse du backend, avec le port et le préfixe de tes routes (s'il y en a un)
const DEFAULT_CONFIG: AppConfig = { apiUrl: 'http://127.0.0.1:5001' }

let cached: AppConfig | null = null

export function getConfig(): AppConfig {
  if (cached) return cached

  const file = join(app.getPath('userData'), 'config.json')
  try {
    if (!existsSync(file)) {
      writeFileSync(file, JSON.stringify(DEFAULT_CONFIG, null, 2))
      cached = DEFAULT_CONFIG
    } else {
      const parsed = JSON.parse(readFileSync(file, 'utf-8'))
      cached = { apiUrl: String(parsed.apiUrl || DEFAULT_CONFIG.apiUrl).replace(/\/+$/, '') }
    }
  } catch {
    cached = DEFAULT_CONFIG
  }
  return cached
}