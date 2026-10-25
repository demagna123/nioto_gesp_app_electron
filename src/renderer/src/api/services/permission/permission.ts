import { Permission } from "@renderer/data/models/Permission"
import { handle } from "../../client"

export type UserPermissionUpdate = {
    permissionId: number;
    isGranted: boolean;
}

export const permissionApi = {
    // Toutes les permissions (catalogue)
    getPermissions: async (): Promise<Permission[]> => {
        const result = await window.api.request({ method: "GET", path: "/permissions" })
        return handle<Permission>(result).data
    },

    // Permissions d'un utilisateur
    getUserPermissions: async (userId: number): Promise<Permission[]> => {
        const result = await window.api.request({ method: "GET", path: `/users/${userId}/permissions` })
        return handle<Permission>(result).data
    },

    // Mise à jour des permissions d'un utilisateur
    updateUserPermissions: async (userId: number, permissions: UserPermissionUpdate[]): Promise<void> => {
        await window.api.request({
            method: "PATCH",
            path: `/users/${userId}/permissions`,
            body: { permissions }
        })
    },
}