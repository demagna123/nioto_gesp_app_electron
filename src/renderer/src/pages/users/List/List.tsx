import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router"
import DataTable from "react-data-table-component"
import type { TableColumn } from "react-data-table-component"
import "../../Employees/List/List.css" // Réutilise le CSS de la liste des employés/équipes
import { User } from "@renderer/data/models/User"
import { userApi } from "@renderer/api/services/user/user"
import Button from "@renderer/components/Button/Button"
import { ROLE_LABELS, UserRole } from "@renderer/data/constant"

const columns: TableColumn<User>[] = [
    { name: "Nom", selector: (row) => row.lastName, sortable: true },
    { name: "Prénom", selector: (row) => row.firstName, sortable: true },
    { name: "Email", selector: (row) => row.email, sortable: true, grow: 2 },
    { name: "Rôle", selector: (row) => ROLE_LABELS[row.role] || row.role, sortable: true },
    {
        name: "Statut",
        selector: (row) => row.isActive,
        cell: (row) => (
            <span className={`status-badge ${row.isActive ? "status-active" : "status-inactive"}`}>
                {row.isActive ? "Actif" : "Inactif"}
            </span>
        ),
        sortable: true,
        width: "120px",
    },
]

export default function ListUser() {
    const navigate = useNavigate()

    const [users, setUsers] = useState<User[]>([])
    const [selectedRows, setSelectedRows] = useState<User[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState<string>("")

    // Chargement
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await userApi.getUsers()
                setUsers(data)
            } catch (err) {
                console.error(err)
                setError("Impossible de charger la liste des utilisateurs.")
            } finally {
                setLoading(false)
            }
        }
        fetchUsers()
    }, [])

    // Filtrage par recherche (nom, prénom ou email)
    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
            const email = user.email.toLowerCase()
            const search = searchTerm.toLowerCase().trim()
            return fullName.includes(search) || email.includes(search)
        })
    }, [users, searchTerm])

    // On vide la sélection si on change de filtre
    useEffect(() => {
        setSelectedRows([])
    }, [searchTerm])

    return (
        <div className="list-container">
            {/* En-tête */}
            <div className="list-header">
                <div>
                    <h1>Gestion des Utilisateurs</h1>
                    <p>Liste de tous les utilisateurs de l'application.</p>
                </div>
                <Button variant="primary" onClick={() => navigate("/users/create")}>
                    + Nouvel Utilisateur
                </Button>
            </div>

            {/* Barre de filtres */}
            <div className="filters-bar">
                <div className="filter-group"></div>
                <div className="search-group">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Rechercher par nom, prénom ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Tableau */}
            <div className="list-card">
                <DataTable
                    columns={columns}
                    data={filteredUsers}
                    selectableRows
                    onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
                    pagination
                    highlightOnHover
                    striped
                    responsive
                    progressPending={loading}
                    noDataComponent={error || "Aucun utilisateur trouvé."}
                />
            </div>

            {/* Bandeau d'actions */}
            <div className="list-actions-bar">
                <span className="selection-info">
                    {selectedRows.length} utilisateur(s) sélectionné(s)
                </span>
                <div className="actions-buttons">
                    <Button 
                        variant="secondary" 
                        disabled={selectedRows.length !== 1} 
                        onClick={() => navigate(`/users/${selectedRows[0].id}`)}
                    >
                        Voir détail
                    </Button>
                    <Button 
                        variant="primary" 
                        disabled={selectedRows.length !== 1} 
                        onClick={() => navigate(`/users/edit/${selectedRows[0].id}`)}
                    >
                        Modifier
                    </Button>
                </div>
            </div>
        </div>
    )
}