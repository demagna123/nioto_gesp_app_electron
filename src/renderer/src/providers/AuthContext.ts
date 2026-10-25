import { createContext, useContext } from "react"
import type { AuthUser } from "../data/models/User"
import type { PermissionCode } from "../data/constant"

export type AuthContextValue = {
    user: AuthUser | null
    permissions: PermissionCode[]
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    hasPermission: (code: PermissionCode) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth doit être utilisé dans un AuthProvider")
    return context
}