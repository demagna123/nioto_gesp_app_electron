import { PermissionCode, UserRole } from "../constant"

export type AuthUser = {
    id: number
    firstName: string
    lastName: string
    email: string
    role: UserRole
    isActive: boolean
}

export type User = {
     id: number
    firstName: string
    lastName: string
    email: string
    role: UserRole
    isActive: boolean
}

// Ce que la page reçoit à la connexion (le jeton reste dans le processus principal)
export type AuthSession = {
    user: AuthUser
    permissions: PermissionCode[]
}
