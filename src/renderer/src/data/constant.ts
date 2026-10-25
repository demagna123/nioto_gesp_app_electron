export const USER_ROLE = {
    ADMIN: "admin",
    PRODUCTION_CHIEF: "production_chief",
    HR: "hr",
    GUARD: "guard",
} as const

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE]


export const ROLE_LABELS: Record<UserRole, string> = {
    admin: "Administrateur",
    production_chief: "Chef de production",
    hr: "Ressources humaines",
    guard: "Gardien",
}
export const EMPLOYEE_TYPE = {
    WORKER: "worker",
    ADMINISTRATIVE: "administrative",
} as const

export type EmployeeType = (typeof EMPLOYEE_TYPE)[keyof typeof EMPLOYEE_TYPE]

export const EMPLOYEE_TYPE_LABELS: Record<EmployeeType, string> = {
    worker: "Ouvrier",
    administrative: "Administratif",
}
export const PERMISSION = {
    ATTENDANCE_ADMINISTRATIVE_MARK: "attendance.administrative.mark",
    ATTENDANCE_WORKER_MARK: "attendance.worker.mark",
    ATTENDANCE_WORKER_MARK_OFF_SCHEDULE: "attendance.worker.markOffSchedule",
    ATTENDANCE_CANCEL: "attendance.cancel",
    ATTENDANCE_CORRECT: "attendance.correct",
    ATTENDANCE_JUSTIFY: "attendance.justify",
    ATTENDANCE_READ: "attendance.read",
    SHIFT_CLOSE: "shift.close",
    SCHEDULE_READ: "schedule.read",
    SCHEDULE_MANAGE: "schedule.manage",
    EMPLOYEE_READ: "employee.read",
    EMPLOYEE_MANAGE: "employee.manage",
    TEAM_READ: "team.read",
    TEAM_MANAGE: "team.manage",
    REPORT_READ: "report.read",
    REPORT_EXPORT: "report.export",
    USER_MANAGE: "user.manage",
    PERMISSION_MANAGE: "permission.manage",
    HISTORY_READ: "history.read",
} as const

export type PermissionCode = (typeof PERMISSION)[keyof typeof PERMISSION]