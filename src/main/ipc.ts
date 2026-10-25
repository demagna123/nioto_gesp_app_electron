import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { request } from './api'
import type { ApiRequest } from './api'
import { clearSession, getPublicSession, setSession } from './session'
const METHODS = ['GET', 'POST', 'PATCH', 'DELETE']

function isValidRequest(req: unknown): req is ApiRequest {
  if (!req || typeof req !== 'object') return false
  const { method, path } = req as ApiRequest
  return (
    METHODS.includes(method) &&
    typeof path === 'string' &&
    path.startsWith('/') &&
    !path.startsWith('//') &&
    !path.includes('..')
  )
}


function safeFileName(value: unknown): string {
  const base =
    typeof value === 'string' && value.trim()
      ? value.replace(/[\\/:*?"<>|]/g, '-').trim()
      : 'Rapport de presence'
  return base.toLowerCase().endsWith('.pdf') ? base : `${base}.pdf`
}
type SigninBody = {
  responseCode: string
  responseMessage: string
  data: { token: string; user: unknown; permissions: string[] }[]
}

export function registerIpc(): void {
  // Appel générique vers l'API
  ipcMain.handle('api:request', async (_event, req: unknown) => {
    if (!isValidRequest(req)) {
      return { ok: false, status: 400, networkError: false, body: null }
    }
    return request(req)
  })

  // Connexion : le jeton est gardé ici, la page ne reçoit que l'utilisateur et ses droits
  ipcMain.handle('auth:signin', async (_event, email: string, password: string) => {
    const result = await request({
      method: 'POST',
      path: '/authentications/signin',
      body: { email, password }
    })

    const body = result.body as SigninBody | null
    if (result.ok && body?.data?.[0]?.token) {
      const { token, user, permissions } = body.data[0]
      setSession({ token, user, permissions })
      return { ...result, body: { ...body, data: [{ user, permissions }] } }
    }
    return result
  })

  ipcMain.handle('auth:signout', () => {
    clearSession()
  })

  // Utile quand la page est rechargée : on retrouve la session
  ipcMain.handle('auth:session', () => getPublicSession())

    // Export du rapport en PDF : même rendu que l'impression, avec une fenêtre « Enregistrer sous »
  ipcMain.handle('report:export-pdf', async (event, suggestedName: unknown) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (!window) return { ok: false, canceled: false, error: 'Fenêtre introuvable.' }

      const { canceled, filePath } = await dialog.showSaveDialog(window, {
        title: 'Enregistrer le rapport',
        defaultPath: join(app.getPath('downloads'), safeFileName(suggestedName)),
        filters: [{ name: 'Document PDF', extensions: ['pdf'] }]
      })
      if (canceled || !filePath) return { ok: false, canceled: true }

      // preferCSSPageSize : on reprend le format défini dans le CSS (A4 paysage, marges)
      const data = await event.sender.printToPDF({ preferCSSPageSize: true, printBackground: true })
      await writeFile(filePath, data)

      return { ok: true, canceled: false, filePath }
    } catch {
      // Cas fréquent : le fichier est déjà ouvert dans un lecteur PDF
      return {
        ok: false,
        canceled: false,
        error: "Impossible d'enregistrer le PDF. Vérifiez qu'il n'est pas déjà ouvert."
      }
    }
  })
}