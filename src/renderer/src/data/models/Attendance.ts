import type { EmployeeType } from "../constant"
import type { Shift } from "./Shift"

export type AttendanceState = "not_arrived" | "present" | "left" | "absent"

export type AttendanceInfo = {
    id: string // UUID du pointage
    checkInAt: string | null
    checkOutAt: string | null
}

// Administratifs : une ligne par employé (attention : id = l'identifiant de l'employé)
export type AdminAttendance = {
    id: number
    employeeNumber: string | null
    lastName: string
    firstName: string
    jobTitle: string
    attendance: AttendanceInfo | null
    state: AttendanceState
}

// Ouvriers : l'employé est dans un objet
export type WorkerRow = {
    employee: {
        id: number
        employeeNumber: string | null
        lastName: string
        firstName: string
        jobTitle: string
    }
    state: AttendanceState
    isOffSchedule: boolean
    attendance: AttendanceInfo | null
}

export type WorkerShiftList = {
    shift: Shift
    shiftDate: string // jour où le poste a commencé (AAAA-MM-JJ)
    weekStartDate: string
    workers: WorkerRow[]
}

// ---------- Rapport hebdomadaire ----------
export type ReportDaily = {
    date: string
    debut: string | null // "HH:MM"
    fin: string | null
    status: "present" | "absent" | null
    isOffSchedule: boolean
    workedMinutes: number
}

export type ReportRow = {
    employee: {
        id: number
        employeeNumber: string | null
        lastName: string
        firstName: string
        jobTitle: string
        type: EmployeeType
    }
    daily: ReportDaily[]
    totalMinutes: number
}

export type ReportData = {
    weekStartDate: string
    weekEndDate: string
    days: { date: string; dayNumber: number; dayName: string }[]
    report: ReportRow[]
}

// ---------- Classement hebdomadaire ----------
export type RankingEntry = {
    employee: {
        id: number
        employeeNumber: string | null
        lastName: string
        firstName: string
        jobTitle: string
        type: EmployeeType
    }
    absences: number
    lates: number
    lateMinutes: number
}

export type RankingData = {
    weekStartDate: string
    weekEndDate: string
    toleranceMinutes: number
    mostAbsent: RankingEntry[]
    mostLate: RankingEntry[]
}

export type CloseShiftResult = {
    shiftId: number
    shiftDate: string
    absentEmployeeIds: number[]
    withoutDeparture: number[]
}