import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { ApiRequest, ApiResult } from '../main/api';

const api = {
  request: (req: ApiRequest): Promise<ApiResult> => ipcRenderer.invoke('api:request', req),
  signIn: (email: string, password: string): Promise<ApiResult> =>
    ipcRenderer.invoke('auth:signin', email, password),
  signOut: (): Promise<void> => ipcRenderer.invoke('auth:signout'),
  getSession: (): Promise<{ user: unknown; permissions: string[] } | null> =>
    ipcRenderer.invoke('auth:session'),
  exportReportPdf: (
    suggestedName: string
  ): Promise<{ ok: boolean; canceled: boolean; filePath?: string; error?: string }> =>
    ipcRenderer.invoke('report:export-pdf', suggestedName)
}


if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
