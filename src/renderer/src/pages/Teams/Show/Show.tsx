import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import DataTable from "react-data-table-component"
import type { TableColumn } from "react-data-table-component"
import "./Show.css"
import { teamApi } from "@renderer/api/services/team/team"
import Button from "@renderer/components/Button/Button"
import type { Team } from "@renderer/data/models/Team"
import type { Employee } from "@renderer/data/models/Employee"
import Alert from "@renderer/components/Alert/Alert"

const memberColumns: TableColumn<Employee>[] = [
    { name: "N° Employé", selector: (row) => row.employeeNumber || "-", sortable: true },
    { name: "Nom", selector: (row) => row.lastName, sortable: true },
    { name: "Prénom", selector: (row) => row.firstName, sortable: true },
    { name: "Poste", selector: (row) => row.jobTitle, sortable: true },
    {
        name: "Statut",
        selector: (row) => row.isActive,
        cell: (row) => (
            <span className={`status-badge ${row.isActive ? "status-active" : "status-inactive"}`}>
                {row.isActive ? "Actif" : "Inactif"}
            </span>
        ),
        sortable: true,
        width: "100px",
    },
]

export default function ShowTeam() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const teamId = Number(id)

    const [team, setTeam] = useState<Team | null>(null)
    const [selectedMembers, setSelectedMembers] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState(false)
    const [actionMessage, setActionMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

    const fetchTeam = async () => {
        try {
            setLoading(true)
            const data = await teamApi.getTeamById(teamId)
            setTeam(data)
        } catch (err) {
            console.error(err)
            setError("Impossible de charger les détails de l'équipe.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (teamId) fetchTeam()
    }, [teamId])

    // --- Retirer un membre ---
    const handleRemoveMembers = async () => {
        if (selectedMembers.length === 0) return
        setActionLoading(true)
        setActionMessage(null)
        try {
            // On retire les membres un par un
            await Promise.all(selectedMembers.map(m => teamApi.removeMember(m.id)))
            setActionMessage({ type: "success", text: `${selectedMembers.length} membre(s) retiré(s) de l'équipe.` })
            setSelectedMembers([])
            await fetchTeam() // Recharger les données
        } catch (err) {
            console.error(err)
            setActionMessage({ type: "error", text: "Erreur lors du retrait des membres." })
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) return <div className="show-container"><p>Chargement...</p></div>
    if (error || !team) return <div className="show-container"><p>{error || "Équipe introuvable."}</p></div>

    return (
        <div className="show-container">
            {/* En-tête */}
            <div className="show-header">
                <div>
                    <h1>{team.name}</h1>
                    <p>{team.employees?.length || 0} membre(s) dans cette équipe</p>
                </div>
                <div className="show-header-actions">
                    <Button variant="secondary" onClick={() => navigate("/teams")}>Retour</Button>
                    <Button variant="primary" onClick={() => navigate(`/teams/edit/${team.id}`)}>Modifier</Button>
                </div>
            </div>

            {actionMessage && (
                <div style={{ marginBottom: "16px" }}>
                    <Alert type={actionMessage.type} onClose={() => setActionMessage(null)}>
                        {actionMessage.text}
                    </Alert>
                </div>
            )}

            {/* Carte infos */}
            <div className="show-card">
                <div className="show-section">
                    <h2>Informations de l'équipe</h2>
                    <div className="show-grid">
                        <div className="show-item">
                            <span className="show-label">Nom</span>
                            <span className="show-value">{team.name}</span>
                        </div>
                        <div className="show-item">
                            <span className="show-label">Description</span>
                            <span className="show-value">{team.description || "-"}</span>
                        </div>
                        <div className="show-item">
                            <span className="show-label">Statut</span>
                            <span className={`status-badge ${team.isActive ? "status-active" : "status-inactive"}`}>
                                {team.isActive ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Membres */}
            <div className="show-card" style={{ marginTop: "24px" }}>
                <div className="members-header">
                    <h2>Membres de l'équipe</h2>
                    {/* ⚠️ À brancher plus tard : bouton Ajouter un membre */}
                    <Button variant="primary" onClick={() => alert("À implémenter : sélection d'un employé")}>
                        + Ajouter un membre
                    </Button>
                </div>

                <DataTable
                    columns={memberColumns}
                    data={team.employees || []}
                    selectableRows
                    onSelectedRowsChange={({ selectedRows }) => setSelectedMembers(selectedRows)}
                    pagination
                    highlightOnHover
                    striped
                    responsive
                    noDataComponent="Aucun membre dans cette équipe."
                />

                {/* Bandeau d'actions pour les membres */}
                <div className="list-actions-bar" style={{ marginTop: "16px", boxShadow: "none", border: "none", padding: 0 }}>
                    <span className="selection-info">
                        {selectedMembers.length} membre(s) sélectionné(s)
                    </span>
                    <div className="actions-buttons">
                        <Button 
                            variant="danger" 
                            disabled={selectedMembers.length === 0 || actionLoading}
                            onClick={handleRemoveMembers}
                        >
                            {actionLoading ? "Retrait..." : "Retirer de l'équipe"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}