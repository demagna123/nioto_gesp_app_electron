import { useCallback, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { AuthContext } from "./AuthContext"
import type { AuthSession } from "../data/models/User"
import type { PermissionCode } from "../data/constant"
import { authApi } from "../api/services/authentication/authentication"

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<AuthSession | null>(null)
    const [loading, setLoading] = useState(true)

    // Au chargement : le processus principal dit s'il y a déjà une session
    useEffect(() => {
        authApi
            .getSession()
            .then(setSession)
            .finally(() => setLoading(false))
    }, [])

    // Le serveur a refusé le jeton : retour à la connexion
    useEffect(() => {
        const onExpired = () => setSession(null)
        window.addEventListener("auth:expired", onExpired)
        return () => window.removeEventListener("auth:expired", onExpired)
    }, [])

    const login = useCallback(async (email: string, password: string) => {
        setSession(await authApi.signIn(email, password))
    }, [])

    const logout = useCallback(async () => {
        await authApi.signOut()
        setSession(null)
    }, [])

    const hasPermission = useCallback(
        (code: PermissionCode) => session?.permissions.includes(code) ?? false,
        [session]
    )

    const value = useMemo(
        () => ({
            user: session?.user ?? null,
            permissions: session?.permissions ?? [],
            login,
            logout,
            hasPermission,
        }),
        [session, login, logout, hasPermission]
    )

    if (loading) return <p style={{ padding: 24 }}>Chargement…</p>

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}