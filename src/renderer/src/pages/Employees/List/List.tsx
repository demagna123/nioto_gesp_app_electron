import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router"
import DataTable from "react-data-table-component"
import type { TableColumn } from "react-data-table-component"
import "./List.css"
import { Employee } from "@renderer/data/models/Employee"
import { employeeApi } from "@renderer/api/services/employee/employee"
import Button from "@renderer/components/Button/Button"
import { EMPLOYEE_TYPE_LABELS, EmployeeType } from "@renderer/data/constant"



const columns: TableColumn<Employee>[] = [
    { name: "N° Employé", selector: (row) => row.employeeNumber || "-", sortable: true },
    { name: "Nom", selector: (row) => row.lastName, sortable: true },
    { name: "Prénom", selector: (row) => row.firstName, sortable: true },
    { name: "Poste", selector: (row) => row.jobTitle, sortable: true },
    { name: "Type", selector: (row) => EMPLOYEE_TYPE_LABELS[row.type], sortable: true },
    { name: "Équipe", selector: (row) => row.team?.name || "-", sortable: true },
    {
        name: "Actif",
        selector: (row) => row.isActive,
        cell: (row) => (
            <span className={`status-badge ${row.isActive ? "status-active" : "status-inactive"}`}>
                {row.isActive ? "Oui" : "Non"}
            </span>
        ),
        sortable: true,
        width: "100px",
    },
]

export default function ListEmployee() {
    const navigate = useNavigate()

    // --- États des données ---
    const [employees, setEmployees] = useState<Employee[]>([])
    const [selectedRows, setSelectedRows] = useState<Employee[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    // --- États des filtres ---
    const [typeFilter, setTypeFilter] = useState<"all" | EmployeeType>("all")
    const [searchTerm, setSearchTerm] = useState<string>("")

    // Chargement des données
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await employeeApi.getEmployees()
                setEmployees(data)
            } catch (err) {
                console.error(err)
                setError("Impossible de charger la liste des employés.")
            } finally {
                setLoading(false)
            }
        }
        fetchEmployees()
    }, [])

    // --- Filtrage côté client ---
    const filteredEmployees = useMemo(() => {
        return employees.filter((emp) => {
            const matchType = typeFilter === "all" || emp.type === typeFilter
            const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase()
            const matchSearch = fullName.includes(searchTerm.toLowerCase().trim())
            return matchType && matchSearch
        })
    }, [employees, typeFilter, searchTerm])

    // On vide la sélection si on change de filtre
    useEffect(() => {
        setSelectedRows([])
    }, [typeFilter, searchTerm])

    return (
        <div className="list-container">
            {/* --- EN-TÊTE AVEC BOUTON CRÉER (NOUVEAU) --- */}
            <div className="list-header">
                <div>
                    <h1>Gestion des Employés</h1>
                    <p>Liste de tous les employés de l'entreprise.</p>
                </div>
                <Button variant="primary" onClick={() => navigate("/employees/create")}>
                    + Nouvel Employé
                </Button>
            </div>

            {/* --- BARRE DE FILTRES --- */}
            <div className="filters-bar">
                <div className="filter-group">
                    <button
                        className={`filter-btn ${typeFilter === "all" ? "active" : ""}`}
                        onClick={() => setTypeFilter("all")}
                    >
                        Tous
                    </button>
                    <button
                        className={`filter-btn ${typeFilter === "worker" ? "active" : ""}`}
                        onClick={() => setTypeFilter("worker")}
                    >
                        Ouvrier
                    </button>
                    <button
                        className={`filter-btn ${typeFilter === "administrative" ? "active" : ""}`}
                        onClick={() => setTypeFilter("administrative")}
                    >
                        Administratif
                    </button>
                </div>

                <div className="search-group">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Rechercher par nom ou prénom..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Le tableau */}
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
                    noDataComponent={error || "Aucun employé trouvé."}
                />
            </div>

            {/* Bandeau d'actions en bas */}
            <div className="list-actions-bar">
                <span className="selection-info">
                    {selectedRows.length} employé(s) sélectionné(s)
                </span>
                <div className="actions-buttons">
                    <Button
                        variant="secondary"
                        disabled={selectedRows.length !== 1}
                        onClick={() => navigate(`/employees/${selectedRows[0].id}`)}
                    >
                        Voir détail
                    </Button>
                    <Button
                        variant="primary"
                        disabled={selectedRows.length !== 1}
                        onClick={() => navigate(`/employees/edit/${selectedRows[0].id}`)}
                    >
                        Modifier
                    </Button>
                </div>
            </div>
        </div>
    )
}