import { Schedule } from "@renderer/data/models/Schedule"
import { handle } from "../../client"

export type CreateSchedulePayload = {
    weekStartDate: string;
    shiftId: number;
    teamId?: number;
    employeeIds?: number[];
}

export const scheduleApi = {
    // Liste des programmations d'une semaine
    getSchedules: async (filters?: { weekStartDate?: string; shiftId?: number }): Promise<Schedule[]> => {
        const params = new URLSearchParams()
        if (filters?.weekStartDate) params.append("weekStartDate", filters.weekStartDate)
        if (filters?.shiftId) params.append("shiftId", String(filters.shiftId))

        const queryString = params.toString()
        const path = queryString ? `/schedules?${queryString}` : "/schedules"

        const result = await window.api.request({ method: "GET", path })
        return handle<Schedule>(result).data
    },

    // Créer une programmation (par équipe ou par employés)
    createSchedule: async (payload: CreateSchedulePayload): Promise<Schedule[]> => {
        const result = await window.api.request({
            method: "POST",
            path: "/schedules/create",
            body: payload
        })
        return handle<Schedule>(result).data
    },

    // Supprimer une programmation
    deleteSchedule: async (id: number): Promise<void> => {
        await window.api.request({ method: "DELETE", path: `/schedules/${id}` })
    },
}