import { Shift } from "@renderer/data/models/Shift"
import { handle } from "../../client"

export type UpdateShiftPayload = {
    startTime?: string;
    endTime?: string;
    crossesMidnight?: boolean;
    isActive?: boolean;
}

export const shiftApi = {
    // Liste
    getShifts: async (filters?: { isActive?: boolean }): Promise<Shift[]> => {
        const params = new URLSearchParams()
        if (filters?.isActive !== undefined) params.append("isActive", String(filters.isActive))

        const queryString = params.toString()
        const path = queryString ? `/shifts?${queryString}` : "/shifts"

        const result = await window.api.request({ method: "GET", path })
        return handle<Shift>(result).data
    },

    // Détail
    getShiftById: async (id: number): Promise<Shift> => {
        const result = await window.api.request({ method: "GET", path: `/shifts/${id}` })
        return handle<Shift>(result).data[0]
    },

    // Mise à jour
    updateShift: async (id: number, payload: UpdateShiftPayload): Promise<Shift> => {
        const result = await window.api.request({
            method: "PATCH",
            path: `/shifts/${id}`,
            body: payload
        })
        return handle<Shift>(result).data[0]
    },
}