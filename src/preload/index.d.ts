import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  type ApiRequest = {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
    path: string
    query?: Record<string, string | number | boolean | undefined>
    body?: unknown
  }

  type ApiResult = {
    ok: boolean
    status: number
    networkError: boolean
    body: unknown
  }

  interface Window {
    electron: ElectronAPI
    api: {
      request: (req: ApiRequest) => Promise<ApiResult>
      signIn: (email: string, password: string) => Promise<ApiResult>
      signOut: () => Promise<void>
      getSession: () => Promise<{ user: unknown; permissions: string[] } | null>
      exportReportPdf: (suggestedName: string) => Promise<ExportPdfResult>
    }
  }

    type ExportPdfResult = {
    ok: boolean
    canceled: boolean
    filePath?: string
    error?: string
  }
}