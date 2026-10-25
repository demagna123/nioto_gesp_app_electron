import { UserRole } from "@renderer/data/constant";
import { handle } from "../../client"
import { User } from '@renderer/data/models/User';

export type CreateUserPayload = {
    lastName: string;
    firstName: string;
    email: string;
    password: string;
    role: UserRole;
}

export type UpdateUserPayload = {
    lastName?: string;
    firstName?: string;
    email?: string;
    role?: UserRole;
    isActive?: boolean;
}


export const userApi = {
    // Récupère la liste des utilisateurs
    getUsers: async (filters?: { role?: string; isActive?: boolean }): Promise<User[]> => {
        const params = new URLSearchParams()
        if (filters?.role) params.append("role", filters.role)
        if (filters?.isActive !== undefined) params.append("isActive", String(filters.isActive))

        const queryString = params.toString()
        const path = queryString ? `/users?${queryString}` : "/users"

        const result = await window.api.request({ method: "GET", path })
        return handle<User>(result).data
    },

     createUser: async (payload: CreateUserPayload): Promise<User> => {
        const result = await window.api.request({
            method: "POST",
            path: "/authentications/registration", // À ajuster si tu as déplacé la route
            body: payload
        })
        return handle<User>(result).data[0]
    },
 getUserById: async (id: number): Promise<User> => {
        const result = await window.api.request({ method: "GET", path: `/users/${id}` })
        return handle<User>(result).data[0]
    },
     // Mise à jour
    updateUser: async (id: number, payload: UpdateUserPayload): Promise<User> => {
        const result = await window.api.request({
            method: "PATCH",
            path: `/users/${id}`,
            body: payload
        })
        return handle<User>(result).data[0]
    },
}