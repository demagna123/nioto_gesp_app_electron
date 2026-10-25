import type { AuthSession } from "../../../data/models/User"
import { handle } from "../../client"

export const authApi = {
    // La connexion passe par le processus principal, qui garde le jeton
    signIn: async (email: string, password: string): Promise<AuthSession> => {
        const result = await window.api.signIn(email, password)
        return handle<AuthSession>(result).data[0]
    },

    signOut: async (): Promise<void> => {
        await window.api.signOut()
    },

    // Retrouve la session après un rechargement de la page
    getSession: async (): Promise<AuthSession | null> => {
        return (await window.api.getSession()) as AuthSession | null
    },
}