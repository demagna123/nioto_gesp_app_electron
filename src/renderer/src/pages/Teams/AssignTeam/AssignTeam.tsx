import { useEffect, useState, useMemo } from "react"
import { useNavigate, useParams } from "react-router"
import DataTable from "react-data-table-component"
import type { TableColumn } from "react-data-table-component"
import "./AssignTeam.css"
import { employeeApi } from "@renderer/api/services/employee/employee"
import { teamApi } from "@renderer/api/services/team/team"
import Button from "@renderer/components/Button/Button"
import type { Employee } from "@renderer/data/models/Employee"
import Alert from "@renderer/components/Alert/Alert"

const columns: TableColumn<Employee>[] = [
    { name: "N° Employé", selector: (row) => row.employeeNumber || "-", sortable: true },
    { name: "Nom", selector: (row) => row.lastName, sortable: true },
    { name: "Prénom", selector: (row) => row.firstName, sortable: true },
    { name: "Poste", selector: (row) => row.jobTitle, sortable: true },
    { 
        name: "Équipe actuelle", 
        selector: (row) => row.team?.name || "Aucune", 
        sortable: true 
    },
]

export default function AssignTeam() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const teamId = Number(id)

    const [employees, setEmployees] = useState<Employee[]>([])
    const [selectedRows, setSelectedRows] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")

    // Chargement des ouvriers actifs
    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                setLoading(true)
                const data = await employeeApi.getEmployees({ type: "worker", isActive: true })
                setEmployees(data)
            } catch (err) {
                console.error(err)
                setError("Impossible de charger la liste des ouvriers.")
            } finally {
                setLoading(false)
            }
        }
        fetchWorkers()
    }, [])

    // Filtrage par recherche
    const filteredEmployees = useMemo(() => {
        return employees.filter((emp) => {
            const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase()
            return fullName.includes(searchTerm.toLowerCase().trim())
        })
    }, [employees, searchTerm])

    // Soumission
    const handleAssign = async () => {
        if (selectedRows.length === 0) return
        setSaving(true)
        setError(null)
        setSuccess(null)
        try {
            const ids = selectedRows.map((e) => e.id)
            await teamApi.assignEmployees(teamId, ids)
            setSuccess(`${ids.length} ouvrier(s) assigné(s) à l'équipe avec succès.`)
            setSelectedRows([])
            // Optionnel : recharger la liste pour mettre à jour "Équipe actuelle"
            const data = await employeeApi.getEmployees({ type: "worker", isActive: true })
            setEmployees(data)
        } catch (err: any) {
            console.error(err)
            setError(err?.message || "Erreur lors de l'assignation.")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="assign-container">
            {/* En-tête */}
            <div className="assign-header">
                <div>
                    <h1>Assigner des ouvriers</h1>
                    <p>Sélectionnez les ouvriers à ajouter à cette équipe.</p>
                </div>
                <Button variant="secondary" onClick={() => navigate(`/teams/${teamId}`)}>
                    Retour à l'équipe
                </Button>
            </div>

            {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}
            {success && <Alert type="success" onClose={() => setSuccess(null)}>{success}</Alert>}

            {/* Barre de recherche */}
            <div className="filters-bar" style={{ marginTop: "16px" }}>
                <div className="filter-group"></div>
                <div className="search-group">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Rechercher un ouvrier..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Tableau */}
            <div className="list-card">
                <DataTable
                    columns={columns}
                    data={filteredEmployees}
                    selectableRows
                    onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
                    pagination
                    highlightOnHover
                    striped
                    responsive
                    progressPending={loading}
                    noDataComponent="Aucun ouvrier disponible."
                />
            </div>

            {/* Bandeau d'actions */}
            <div className="list-actions-bar">
                <span className="selection-info">
                    {selectedRows.length} ouvrier(s) sélectionné(s)
                </span>
                <div className="actions-buttons">
                    <Button 
                        variant="primary" 
                        disabled={selectedRows.length === 0 || saving}
                        onClick={handleAssign}
                    >
                        {saving ? "Assignation..." : "Assigner à l'équipe"}
                    </Button>
                </div>
            </div>
        </div>
    )
}