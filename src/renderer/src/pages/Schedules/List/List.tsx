import { useEffect, useState, useMemo } from "react"
import DataTable from "react-data-table-component"
import type { TableColumn } from "react-data-table-component"
import "./List.css"
import { Schedule } from "@renderer/data/models/Schedule"
import { scheduleApi } from "@renderer/api/services/schedule/schedule"
import { teamApi } from "@renderer/api/services/team/team"
import { shiftApi } from "@renderer/api/services/shift/shift"
import { Team } from "@renderer/data/models/Team"
import { Shift } from "@renderer/data/models/Shift"
import Button from "@renderer/components/Button/Button"
import Alert from "@renderer/components/Alert/Alert"

const SHIFT_LABELS: Record<string, string> = {
  morning: "Matin",
  afternoon: "Après-midi",
  night: "Nuit",
}

const getMonday = (date: Date): string => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().split("T")[0]
}

// Type pour le regroupement
type GroupedSchedule = {
  id: string; // ID fictif basé sur l'équipe et le shift
  teamId: number;
  teamName: string;
  shiftId: number;
  shiftName: string;
  employeeCount: number;
  employeeIds: number[]; // Pour la suppression
  scheduleIds: number[]; // Les IDs réels des schedules pour la suppression
}

const columns: TableColumn<GroupedSchedule>[] = [
  {
    name: "Équipe",
    selector: (row) => row.teamName,
    sortable: true
  },
  {
    name: "Shift",
    selector: (row) => SHIFT_LABELS[row.shiftName] || row.shiftName,
    sortable: true,
    width: "150px"
  },
  {
    name: "Nombre d'ouvriers",
    selector: (row) => row.employeeCount,
    sortable: true,
    width: "180px",
    cell: (row) => <span>{row.employeeCount} ouvrier(s)</span>
  }
]

export default function ListSchedule() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [selectedRows, setSelectedRows] = useState<GroupedSchedule[]>([])

  const [weekStartDate, setWeekStartDate] = useState<string>(getMonday(new Date()))
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")
  const [selectedShiftId, setSelectedShiftId] = useState<string>("")

  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Charger les équipes et shifts au montage
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsData, shiftsData] = await Promise.all([
          teamApi.getTeams({ isActive: true }),
          shiftApi.getShifts({ isActive: true })
        ])
        setTeams(teamsData)
        setShifts(shiftsData)
      } catch (err) {
        console.error(err)
      }
    }
    fetchData()
  }, [])

  // Charger les programmations
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await scheduleApi.getSchedules({ weekStartDate })
        setSchedules(data)
      } catch (err) {
        console.error(err)
        setError("Impossible de charger les programmations.")
      } finally {
        setLoading(false)
      }
    }
    fetchSchedules()
  }, [weekStartDate])

  // --- REGROUPEMENT DES DONNÉES PAR ÉQUIPE ET SHIFT ---
  const groupedSchedules = useMemo(() => {
    const groups: Record<string, GroupedSchedule> = {}

    schedules.forEach(s => {
      // Si l'employé n'a pas d'équipe d'origine, on le met dans "Sans équipe"
      const teamId = s.originTeam?.id || 0
      const teamName = s.originTeam?.name || "Sans équipe"
      
      // Clé unique pour le regroupement (Équipe + Shift)
      const key = `${teamId}-${s.shiftId}`

      if (!groups[key]) {
        groups[key] = {
          id: key,
          teamId: teamId,
          teamName: teamName,
          shiftId: s.shiftId,
          shiftName: s.shift.name,
          employeeCount: 0,
          employeeIds: [],
          scheduleIds: []
        }
      }

      groups[key].employeeCount += 1
      groups[key].employeeIds.push(s.employeeId)
      groups[key].scheduleIds.push(s.id)
    })

    return Object.values(groups)
  }, [schedules])

  // Programmer une équipe
  const handleCreate = async () => {
    if (!selectedTeamId || !selectedShiftId) {
      setError("Veuillez sélectionner une équipe et un shift.")
      return
    }
    setCreating(true)
    setError(null)
    setSuccess(null)
    try {
      await scheduleApi.createSchedule({
        weekStartDate,
        shiftId: Number(selectedShiftId),
        teamId: Number(selectedTeamId)
      })
      setSuccess("Équipe programmée avec succès.")
      
      const data = await scheduleApi.getSchedules({ weekStartDate })
      setSchedules(data)
      setSelectedTeamId("")
      setSelectedShiftId("")
    } catch (err: any) {
      console.error(err)
      setError(err?.message || "Erreur lors de la programmation.")
    } finally {
      setCreating(false)
    }
  }

  // Supprimer les programmations d'une équipe
  const handleDelete = async () => {
    if (selectedRows.length === 0) return
    if (!confirm("Voulez-vous vraiment retirer cette équipe de la programmation ?")) return

    try {
      // On récupère tous les IDs de schedules de toutes les équipes sélectionnées
      const allScheduleIds = selectedRows.flatMap(row => row.scheduleIds)
      
      await Promise.all(allScheduleIds.map(id => scheduleApi.deleteSchedule(id)))
      
      setSuccess(`Équipe(s) retirée(s) de la programmation.`)
      setSelectedRows([])
      
      const data = await scheduleApi.getSchedules({ weekStartDate })
      setSchedules(data)
    } catch (err) {
      console.error(err)
      setError("Erreur lors de la suppression.")
    }
  }

  return (
    <div className="list-container">
      <div className="list-header">
        <div>
          <h1>Programmation des Équipes</h1>
          <p>Programmez les équipes sur les shifts de la semaine.</p>
        </div>
      </div>

      {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess(null)}>{success}</Alert>}

      {/* Formulaire de programmation */}
      <div className="list-card schedule-form-card">
        <div className="schedule-form">
          <div className="field schedule-field">
            <label>Semaine (lundi)</label>
            <input
              type="date"
              className="field-control"
              value={weekStartDate}
              onChange={(e) => setWeekStartDate(e.target.value)}
            />
          </div>
          <div className="field schedule-field">
            <label>Équipe</label>
            <select
              className="field-control"
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
            >
              <option value="">-- Choisir --</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="field schedule-field">
            <label>Shift</label>
            <select
              className="field-control"
              value={selectedShiftId}
              onChange={(e) => setSelectedShiftId(e.target.value)}
            >
              <option value="">-- Choisir --</option>
              {shifts.map(s => (
                <option key={s.id} value={s.id}>{SHIFT_LABELS[s.name] || s.name}</option>
              ))}
            </select>
          </div>
          <div className="schedule-action">
            <Button variant="primary" onClick={handleCreate} disabled={creating}>
              {creating ? "Programmation..." : "Programmer l'équipe"}
            </Button>
          </div>
        </div>
      </div>

      {/* Tableau des programmations regroupées */}
      <div className="list-card">
        <DataTable
          columns={columns}
          data={groupedSchedules}
          selectableRows
          onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
          pagination
          highlightOnHover
          striped
          responsive
          progressPending={loading}
          noDataComponent="Aucune équipe programmée pour cette semaine."
        />
      </div>

      {/* Bandeau d'actions */}
      <div className="list-actions-bar">
        <span className="selection-info">
          {selectedRows.length} programmation(s) sélectionnée(s)
        </span>
        <div className="actions-buttons">
          <Button
            variant="danger"
            disabled={selectedRows.length === 0}
            onClick={handleDelete}
          >
            Retirer la programmation
          </Button>
        </div>
      </div>
    </div>
  )
}