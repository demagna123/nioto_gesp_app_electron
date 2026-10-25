import { useCallback, useEffect, useState } from "react"
import "./Attendance.css"
import { attendanceApi } from "@renderer/api/services/attendance/attendance"
import { ApiError } from "@renderer/api/client"
import Toggle from "@renderer/components/Toggle/Toggle"
import Button from "@renderer/components/Button/Button"
import Alert from "@renderer/components/Alert/Alert"
import type { AdminAttendance, AttendanceInfo, AttendanceState, WorkerRow } from "@renderer/data/models/Attendance"
import type { Shift } from "@renderer/data/models/Shift"

const SHIFT_LABELS: Record<string, string> = { morning: "Matin", afternoon: "Après-midi", night: "Nuit" }
const REFRESH_MS = 30000 // rafraîchissement silencieux

// Une ligne d'affichage, la même pour les deux onglets
type Row = {
    id: number // identifiant de l'employé
    lastName: string
    firstName: string
    jobTitle: string
    state: AttendanceState
    attendance: AttendanceInfo | null
    isOffSchedule: boolean
}

// Les lignes arrivent à plat (administratifs) ou avec l'employé dans un objet (ouvriers)
function toRow(item: AdminAttendance | WorkerRow): Row {
    if ("employee" in item) {
        return {
            id: item.employee.id,
            lastName: item.employee.lastName,
            firstName: item.employee.firstName,
            jobTitle: item.employee.jobTitle,
            state: item.state,
            attendance: item.attendance,
            isOffSchedule: item.isOffSchedule,
        }
    }
    return {
        id: item.id,
        lastName: item.lastName,
        firstName: item.firstName,
        jobTitle: item.jobTitle,
        state: item.state,
        attendance: item.attendance,
        isOffSchedule: (item as { isOffSchedule?: boolean }).isOffSchedule ?? false,
    }
}

const messageOf = (err: unknown, fallback: string): string => (err instanceof ApiError ? err.message : fallback)

const formatTime = (iso: string | null | undefined): string =>
    iso ? new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) : "-"

export default function Attendance() {
    const [activeTab, setActiveTab] = useState<"administratives" | "workers">("administratives")
    const [actionType, setActionType] = useState<"in" | "out">("in")

    const [admins, setAdmins] = useState<Row[]>([])
    const [workers, setWorkers] = useState<Row[]>([])
    const [currentShift, setCurrentShift] = useState<Shift | null>(null)
    const [loading, setLoading] = useState(true)

    const [busyId, setBusyId] = useState<number | null>(null) // pointage en cours d'envoi
    const [closing, setClosing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // silent = true : rafraîchissement sans « Chargement… » ni message d'erreur
    const loadAdmins = useCallback(async (silent = false) => {
        if (!silent) setLoading(true)
        try {
            const data = await attendanceApi.getAdministrativeList()
            setAdmins(data.map(toRow))
        } catch (err) {
            if (!silent) setError(messageOf(err, "Erreur lors du chargement des administratifs."))
        } finally {
            if (!silent) setLoading(false)
        }
    }, [])

    const loadWorkers = useCallback(async (silent = false) => {
        if (!silent) setLoading(true)
        try {
            const data = await attendanceApi.getWorkersCurrentShift()
            setWorkers(data.workers.map(toRow))
            setCurrentShift(data.shift)
        } catch (err) {
            if (!silent) setError(messageOf(err, "Erreur lors du chargement des ouvriers."))
        } finally {
            if (!silent) setLoading(false)
        }
    }, [])

    // Chargement à l'ouverture et au changement d'onglet, puis toutes les 30 secondes
    useEffect(() => {
        const load = activeTab === "administratives" ? loadAdmins : loadWorkers
        load()
        const timer = setInterval(() => load(true), REFRESH_MS)
        return () => clearInterval(timer)
    }, [activeTab, loadAdmins, loadWorkers])

    // ---------- Pointage ----------
    const handleToggle = async (row: Row) => {
        if (busyId !== null) return
        setBusyId(row.id)
        setError(null)
        setSuccess(null)

        const reload = activeTab === "administratives" ? loadAdmins : loadWorkers

        try {
            if (activeTab === "administratives") {
                if (actionType === "in") await attendanceApi.checkInAdmin(row.id)
                else await attendanceApi.checkOutAdmin(row.id)
            } else {
                if (!currentShift) return
                if (actionType === "in") {
                    await attendanceApi.checkInWorker(row.id, currentShift.id)
                } else {
                    if (!row.attendance) {
                        setError("Impossible de trouver le pointage d'arrivée de cette personne.")
                        return
                    }
                    await attendanceApi.checkOutWorker(row.attendance.id)
                }
            }
            await reload(true)
            setSuccess(`${actionType === "in" ? "Arrivée" : "Départ"} enregistré : ${row.firstName} ${row.lastName}`)
        } catch (err) {
            setError(messageOf(err, "Erreur lors du pointage."))
            reload(true) // l'écran se remet d'accord avec le serveur (ex. déjà pointé par un autre gardien)
        } finally {
            setBusyId(null)
        }
    }

    // ---------- Clôture du poste ----------
    const handleCloseShift = async () => {
        if (!currentShift) return
        if (!window.confirm("Clôturer le poste ? Les ouvriers programmés qui n'ont pas pointé seront marqués absents.")) return

        setClosing(true)
        setError(null)
        setSuccess(null)
        try {
            const result = await attendanceApi.closeShift(currentShift.id)
            const noExit = result.withoutDeparture.length
            setSuccess(
                `Poste clôturé : ${result.absentEmployeeIds.length} absent(s) enregistré(s).` +
                    (noExit > 0 ? ` Attention : ${noExit} personne(s) sans départ enregistré.` : "")
            )
            await loadWorkers(true)
        } catch (err) {
            setError(messageOf(err, "Impossible de clôturer le poste."))
        } finally {
            setClosing(false)
        }
    }

    // ---------- Affichage ----------
    const rows = activeTab === "administratives" ? admins : workers
    // L'onglet Départ n'affiche que les personnes qui sont arrivées
    const visibleRows = actionType === "out" ? rows.filter((r) => r.state === "present" || r.state === "left") : rows

    return (
        <div className="attendance-container">
            <div className="attendance-header">
                <h1>Pointage</h1>
                <div className="attendance-controls">
                    <select
                        className="field-control"
                        value={actionType}
                        onChange={(e) => setActionType(e.target.value as "in" | "out")}
                    >
                        <option value="in">Arrivée</option>
                        <option value="out">Départ</option>
                    </select>
                </div>
            </div>

            {error && (
                <Alert type="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert type="success" onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            <div className="attendance-tabs">
                <button className={activeTab === "administratives" ? "active" : ""} onClick={() => setActiveTab("administratives")}>
                    Administratifs
                </button>
                <button className={activeTab === "workers" ? "active" : ""} onClick={() => setActiveTab("workers")}>
                    Ouvriers
                </button>
            </div>

            {activeTab === "workers" && currentShift && (
                <div className="shift-banner">
                    Poste en cours : <strong>{SHIFT_LABELS[currentShift.name] ?? currentShift.name}</strong> (
                    {currentShift.startTime.slice(0, 5)} - {currentShift.endTime.slice(0, 5)})
                </div>
            )}

            <div className="attendance-card">
                {loading ? (
                    <p>Chargement...</p>
                ) : visibleRows.length === 0 ? (
                    <p className="attendance-empty">
                        {activeTab === "administratives"
                            ? "Aucun administratif attendu aujourd'hui (week-end ou aucun employé actif)."
                            : "Aucune personne à afficher."}
                    </p>) : (
                    <table className="attendance-table">
                        <thead>
                            <tr>
                                <th>Employé</th>
                                <th>Fonction</th>
                                <th>Arrivée</th>
                                <th>Départ</th>
                                <th style={{ textAlign: "center" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleRows.map((row) => {
                                const isChecked =
                                    actionType === "in"
                                        ? row.state === "present" || row.state === "left"
                                        : row.state === "left"
                                const isDisabled =
                                    busyId !== null ||
                                    (actionType === "in" && row.state !== "not_arrived") ||
                                    (actionType === "out" && row.state !== "present")

                                return (
                                    <tr key={row.id}>
                                        <td>
                                            {row.lastName} {row.firstName}
                                            {row.isOffSchedule && <span className="attendance-badge">Hors planning</span>}
                                            {row.state === "absent" && (
                                                <span className="attendance-badge attendance-badge-absent">Absent</span>
                                            )}
                                        </td>
                                        <td>{row.jobTitle}</td>
                                        <td>{formatTime(row.attendance?.checkInAt)}</td>
                                        <td>{formatTime(row.attendance?.checkOutAt)}</td>
                                        <td style={{ textAlign: "center" }}>
                                            <Toggle
                                                checked={isChecked}
                                                onChange={() => handleToggle(row)}
                                                disabled={isDisabled}
                                                label={`${actionType === "in" ? "Arrivée" : "Départ"} de ${row.firstName} ${row.lastName}`}
                                            />
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {activeTab === "workers" && currentShift && (
                <div className="attendance-footer">
                    <Button variant="danger" onClick={handleCloseShift} loading={closing}>
                        Clôturer le poste
                    </Button>
                </div>
            )}
        </div>
    )
}