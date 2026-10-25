import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import "./Show.css"
import { employeeApi } from "@renderer/api/services/employee/employee"
import Button from "@renderer/components/Button/Button"
import type { Employee } from "@renderer/data/models/Employee"
import { EMPLOYEE_TYPE_LABELS } from "@renderer/data/constant"

export default function ShowEmployee() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const employeeId = Number(id)

    const [employee, setEmployee] = useState<Employee | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                setLoading(true)
                const data = await employeeApi.getEmployeeById(employeeId)
                setEmployee(data)
            } catch (err) {
                console.error(err)
                setError("Impossible de charger les détails de l'employé.")
            } finally {
                setLoading(false)
            }
        }
        if (employeeId) fetchEmployee()
    }, [employeeId])

    if (loading) return <div className="show-container"><p>Chargement...</p></div>
    if (error || !employee) return <div className="show-container"><p>{error || "Employé introuvable."}</p></div>

    return (
        <div className="show-container">
            {/* En-tête */}
            <div className="show-header">
                <div>
                    <h1>{employee.firstName} {employee.lastName}</h1>
                    <p>Matricule : {employee.employeeNumber || "-"}</p>
                </div>
                <div className="show-header-actions">
                    <Button variant="secondary" onClick={() => navigate("/employees")}>
                        Retour
                    </Button>
                    <Button variant="primary" onClick={() => navigate(`/employees/edit/${employee.id}`)}>
                        Modifier
                    </Button>
                </div>
            </div>

            {/* Carte d'informations */}
            <div className="show-card">
                <div className="show-section">
                    <h2>Informations personnelles</h2>
                    <div className="show-grid">
                        <div className="show-item">
                            <span className="show-label">Nom</span>
                            <span className="show-value">{employee.lastName}</span>
                        </div>
                        <div className="show-item">
                            <span className="show-label">Prénom</span>
                            <span className="show-value">{employee.firstName}</span>
                        </div>
                        <div className="show-item">
                            <span className="show-label">Email</span>
                            <span className="show-value">{employee.email || "-"}</span>
                        </div>
                    </div>
                </div>

                <div className="show-section">
                    <h2>Informations professionnelles</h2>
                    <div className="show-grid">
                        <div className="show-item">
                            <span className="show-label">Poste</span>
                            <span className="show-value">{employee.jobTitle}</span>
                        </div>
                        <div className="show-item">
                            <span className="show-label">Type</span>
                            <span className="show-value">{EMPLOYEE_TYPE_LABELS[employee.type]}</span>
                        </div>
                        <div className="show-item">
                            <span className="show-label">Équipe</span>
                            <span className="show-value">{employee.team?.name || "-"}</span>
                        </div>
                        <div className="show-item">
                            <span className="show-label">Date d'embauche</span>
                            <span className="show-value">{employee.hireDate}</span>
                        </div>
                        <div className="show-item">
                            <span className="show-label">Statut</span>
                            <span className={`status-badge ${employee.isActive ? "status-active" : "status-inactive"}`}>
                                {employee.isActive ? "Actif" : "Inactif"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}