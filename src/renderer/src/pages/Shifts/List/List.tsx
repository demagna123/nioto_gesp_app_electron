import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import DataTable from "react-data-table-component"
import type { TableColumn } from "react-data-table-component"
import "../../Employees/List/List.css" // Réutilise le CSS des listes
import { Shift } from "@renderer/data/models/Shift"
import { shiftApi } from "@renderer/api/services/shift/shift"
import Button from "@renderer/components/Button/Button"

// Labels lisibles pour les noms de shift
const SHIFT_LABELS: Record<string, string> = {
    morning: "Matin",
    afternoon: "Après-midi",
    night: "Nuit",
}

const columns: TableColumn<Shift>[] = [
    { 
        name: "Nom", 
        selector: (row) => SHIFT_LABELS[row.name] || row.name, 
        sortable: true 
    },
    { 
        name: "Heure début", 
        selector: (row) => row.startTime, 
        sortable: true,
        width: "130px"
    },
    { 
        name: "Heure fin", 
        selector: (row) => row.endTime, 
        sortable: true,
        width: "130px"
    },
    {
        name: "Traverse minuit",
        selector: (row) => row.crossesMidnight,
        cell: (row) => (
            <span className={`status-badge ${row.crossesMidnight ? "status-active" : "status-inactive"}`}>
                {row.crossesMidnight ? "Oui" : "Non"}
            </span>
        ),
        sortable: true,
        width: "150px",
    },
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

export default function ListShift() {
    const navigate = useNavigate()

    const [shifts, setShifts] = useState<Shift[]>([])
    const [selectedRows, setSelectedRows] = useState<Shift[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    // Chargement
    useEffect(() => {
        const fetchShifts = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await shiftApi.getShifts()
                setShifts(data)
            } catch (err) {
                console.error(err)
                setError("Impossible de charger la liste des postes.")
            } finally {
                setLoading(false)
            }
        }
        fetchShifts()
    }, [])

    // Recharger après une désactivation/activation
    const reloadShifts = async () => {
        const data = await shiftApi.getShifts()
        setShifts(data)
        setSelectedRows([])
    }

    // Désactiver / Activer
    const handleToggleActive = async () => {
        if (selectedRows.length !== 1) return
        const shift = selectedRows[0]
        try {
            await shiftApi.updateShift(shift.id, { isActive: !shift.isActive })
            await reloadShifts()
        } catch (err) {
            console.error(err)
            setError("Erreur lors de la modification du statut.")
        }
    }

    return (
        <div className="list-container">
            {/* En-tête */}
            <div className="list-header">
                <div>
                    <h1>Gestion des Postes (Shifts)</h1>
                    <p>Liste des postes de travail de l'entreprise.</p>
                </div>
            </div>

            {/* Tableau */}
            <div className="list-card">
                <DataTable
                    columns={columns}
                    data={shifts}
                    selectableRows
                    onSelectedRowsChange={({ selectedRows }) => setSelectedRows(selectedRows)}
                    pagination
                    highlightOnHover
                    striped
                    responsive
                    progressPending={loading}
                    noDataComponent={error || "Aucun poste trouvé."}
                />
            </div>

            {/* Bandeau d'actions */}
            <div className="list-actions-bar">
                <span className="selection-info">
                    {selectedRows.length} poste(s) sélectionné(s)
                </span>
                <div className="actions-buttons">
                    <Button 
                        variant="secondary" 
                        disabled={selectedRows.length !== 1} 
                        onClick={() => navigate(`/shifts/edit/${selectedRows[0].id}`)}
                    >
                        Modifier
                    </Button>
                    <Button 
                        variant={selectedRows.length === 1 && selectedRows[0].isActive ? "danger" : "primary"}
                        disabled={selectedRows.length !== 1} 
                        onClick={handleToggleActive}
                    >
                        {selectedRows.length === 1 && selectedRows[0].isActive ? "Désactiver" : "Activer"}
                    </Button>
                </div>
            </div>
        </div>
    )
}