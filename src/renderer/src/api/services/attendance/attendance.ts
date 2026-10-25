import { call } from "../../client"
import type { EmployeeType } from "@renderer/data/constant"
import type {
    AdminAttendance,
    AttendanceInfo,
    AttendanceState,
    CloseShiftResult,
    RankingData,
    ReportData,
    WorkerShiftList,
} from "@renderer/data/models/Attendance"

export const attendanceApi = {

     getRanking: async (weekStartDate: string, type?: EmployeeType, limit?: number): Promise<RankingData> => {
        return (await call<RankingData>("GET", "/attendances/ranking", { query: { weekStartDate, type, limit } })).data[0]
    },
    // ---------- Administratifs ----------
    getAdministrativeList: async (): Promise<AdminAttendance[]> => {
        return (await call<AdminAttendance>("GET", "/attendances/administrative")).data
    },

    checkInAdmin: async (employeeId: number): Promise<void> => {
        await call("POST", "/attendances/administrative/check-in", { body: { employeeId } })
    },

    checkOutAdmin: async (employeeId: number): Promise<void> => {
        await call("POST", "/attendances/administrative/check-out", { body: { employeeId } })
    },

    // ---------- Ouvriers ----------
    // Liste d'un poste précis (état facultatif : "present" pour l'onglet Départ)
    getWorkers: async (shiftId: number, state?: AttendanceState): Promise<WorkerShiftList> => {
        return (await call<WorkerShiftList>("GET", "/attendances/workers", { query: { shiftId, state } })).data[0]
    },

    // Poste en cours (ta route workerCurrent : à vérifier, voir la remarque)
    getWorkersCurrentShift: async (): Promise<WorkerShiftList> => {
        return (await call<WorkerShiftList>("GET", "/attendances/workers/current")).data[0]
    },

    checkInWorker: async (employeeId: number, shiftId: number): Promise<AttendanceInfo> => {
        return (await call<AttendanceInfo>("POST", "/attendances/workers/check-in", { body: { employeeId, shiftId } })).data[0]
    },

    // Ouvrier qui n'est pas programmé sur ce poste
    checkInWorkerOffSchedule: async (employeeId: number, shiftId: number): Promise<AttendanceInfo> => {
        return (await call<AttendanceInfo>("POST", "/attendances/workers/off-schedule/check-in", { body: { employeeId, shiftId } })).data[0]
    },

    checkOutWorker: async (attendanceId: string): Promise<void> => {
        await call("POST", "/attendances/workers/check-out", { body: { attendanceId } })
    },

    closeShift: async (shiftId: number, shiftDate?: string): Promise<CloseShiftResult> => {
        return (await call<CloseShiftResult>("POST", "/attendances/workers/close", { body: { shiftId, shiftDate } })).data[0]
    },

    // ---------- Les deux ----------
    // Annule la dernière action (départ s'il y en a un, sinon arrivée), dans le délai prévu
    cancel: async (attendanceId: string): Promise<void> => {
        await call("POST", `/attendances/${attendanceId}/cancel`)
    },

    // ---------- Rapport ----------
    getWeeklyReport: async (weekStartDate: string, type?: EmployeeType): Promise<ReportData> => {
        return (await call<ReportData>("GET", "/attendances/report", { query: { weekStartDate, type } })).data[0]
    },

   
}