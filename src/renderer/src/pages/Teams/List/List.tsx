import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router"
import DataTable from "react-data-table-component"
import type { TableColumn } from "react-data-table-component"
import "./List.css"
import { Team } from "@renderer/data/models/Team"
import { teamApi } from "@renderer/api/services/team/team" // Adapte le chemin si besoin
import Button from "@renderer/components/Button/Button"

const columns: TableColumn<Team>[] = [
    { name: "Nom de l'équipe", selector: (row) => row.name, sortable: true },
    { name: "Description", selector: (row) => row.description || "-", sortable: true, grow: 2 },
    {
        name: "Membres",
        selector: (row) => row.membersCount,
        sortable: true,
        width: "120px",
        cell: (row) => <span>{row.membersCount} membre(s)</span>
    },
    {
        name: "Statut",
        selector: (row) => row.isActive,
        cell: (row) => (
            <span className={`status-badge ${row.isActive ? "status-active" : "status-inactive"}`}>
                {row.isActive ? "Active" : "Inactive"}
            </span>
        ),
        sortable: true,
        width: "120px",
    },
]

export default function ListTeam() {
    const navigate = useNavigate()

    // --- États des données ---
    const [teams, setTeams] = useState<Team[]>([])
    const [selectedRows, setSelectedRows] = useState<Team[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    // --- États des filtres ---
    const [searchTerm, setSearchTerm] = useState<string>("")

    // Chargement des données
    useEffect(() => {
        const fetchTeams = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await teamApi.getTeams()
                setTeams(data)
            } catch (err) {
                console.error(err)
                setError("Impossible de charger la liste des équipes.")
            } finally {
                setLoading(false)
            }
        }
        fetchTeams()
    }, [])

    // --- Filtrage côté client (Recherche par nom) ---
    const filteredTeams = useMemo(() => {
        return teams.filter((team) => {
            const matchSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
            return matchSearch
        })
    }, [teams, searchTerm])

    // On vide la sélection si on change de filtre
    useEffect(() => {
        setSelectedRows([])
    }, [searchTerm])

    return (
        <div className="list-container">
            {/* --- EN-TÊTE --- */}
            <div className="list-header">
                <div>
                    <h1>Gestion des Équipes</h1>
                    <p>Liste de toutes les équipes de l'entreprise.</p>
                </div>
                <Button variant="primary" onClick={() => navigate("/teams/create")}>
                    + Nouvelle Équipe
                </Button>
            </div>

            {/* --- BARRE DE FILTRES --- */}
            <div className="filters-bar">
                <div className="filter-group">
                    {/* Pas de filtre par type ici, juste la recherche */}
                </div>

                <div className="search-group">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Rechercher une équipe par nom..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Le tableau */}
            <div className="list-card">
                <DataTable
                    columns={columns}
                    data={filteredTeams}
                    selectableRows
                    onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
                    pagination
                    highlightOnHover
                    striped
                    responsive
                    progressPending={loading}
                    noDataComponent={error || "Aucune équipe trouvée."}
                />
            </div>

            {/* Bandeau d'actions en bas */}
            <div className="list-actions-bar">
                <span className="selection-info">
                    {selectedRows.length} équipe(s) sélectionnée(s)
                </span>
                <div className="actions-buttons">
                    <Button
                        variant="secondary"
                        disabled={selectedRows.length !== 1}
                        onClick={() => navigate(`/teams/${selectedRows[0].id}`)}
                    >
                        Voir détail
                    </Button>
                   
                    <Button
                        variant="secondary"
                        disabled={selectedRows.length !== 1}
                        onClick={() => navigate(`/teams/assign/${selectedRows[0].id}`)}
                    >
                        Assigner des ouvriers
                    </Button>
                    <Button
                        variant="primary"
                        disabled={selectedRows.length !== 1}
                        onClick={() => navigate(`/teams/edit/${selectedRows[0].id}`)}
                    >
                        Modifier
                    </Button>
                </div>
            </div>
        </div>
    )
}