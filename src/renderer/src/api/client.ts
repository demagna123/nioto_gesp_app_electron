import type { ApiResponse } from "../responses/responses"

export class ApiError extends Error {
    status: number
    networkError: boolean
    data: unknown[]

    constructor(message: string, status: number, networkError: boolean, data: unknown[] = []) {
        super(message)
        this.status = status
        this.networkError = networkError
        this.data = data
    }
}

// Transforme le résultat du processus principal : renvoie la réponse, ou lève une ApiError
export function handle<T>(result: ApiResult): ApiResponse<T> {
    if (result.networkError) {
        throw new ApiError("Le serveur est injoignable. Vérifiez le réseau.", 0, true)
    }

    const body = result.body as Partial<ApiResponse<T>> | null

    if (!result.ok) {
        // Session expirée : le AuthProvider ramènera à la connexion
        if (result.status === 401) window.dispatchEvent(new Event("auth:expired"))
        throw new ApiError(body?.responseMessage ?? "Une erreur est survenue.", result.status, false, body?.data ?? [])
    }

    return body as ApiResponse<T>
}

type CallOptions = {
    query?: ApiRequest["query"]
    body?: unknown
}

// Appel générique : c'est ce que les fichiers de services utiliseront
export async function call<T>(
    method: ApiRequest["method"],
    path: string,
    options: CallOptions = {}
): Promise<ApiResponse<T>> {
    const result = await window.api.request({ method, path, ...options })
    return handle<T>(result)
}