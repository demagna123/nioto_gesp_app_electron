import { call } from "../../client"

export type DashboardData = {
    employees: {
        total: number
        administrative: number
        worker: number
    }
    today: {
        expected: number // administratifs actifs + ouvriers programmés sur le poste en cours
        expectedAdministrative: number
        expectedWorker: number
        present: number
        presentAdministrative: number
        presentWorker: number
        absent: number // attendus qui n'ont pas encore pointé
        absentAdministrative: number
        absentWorker: number
    }
    teams: number
    currentShift: {
        id: number
        name: string
        startTime: string
        endTime: string
    } | null
    last7Days: {
        name: string
        date: string
        administrative: number
        worker: number
    }[]
}

export const dashboardApi = {
    getStats: async (): Promise<DashboardData> => {
        return (await call<DashboardData>("GET", "/dashboard")).data[0]
    },
}