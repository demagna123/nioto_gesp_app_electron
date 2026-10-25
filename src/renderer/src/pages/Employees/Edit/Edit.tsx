import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import "../Create/Create.css" // On réutilise le CSS de Create
import { employeeApi, UpdateEmployeePayload } from "@renderer/api/services/employee/employee"
import Button from "@renderer/components/Button/Button"
import Input from "@renderer/components/Input/Input"
import { ApiError } from "@renderer/api/client"
import Alert from "@renderer/components/Alert/Alert"
import { EMPLOYEE_TYPE_LABELS, EmployeeType } from "@renderer/data/constant"

export default function EditEmployee() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const employeeId = Number(id)

    // --- États des champs ---
    const [lastName, setLastName] = useState("")
    const [firstName, setFirstName] = useState("")
    const [jobTitle, setJobTitle] = useState("")
    const [email, setEmail] = useState("")
    const [isActive, setIsActive] = useState(true)

    // --- Champs non modifiables (affichage seul) ---
    const [employeeNumber, setEmployeeNumber] = useState<string | null>(null)
    const [type, setType] = useState<EmployeeType>("worker")
    const [hireDate, setHireDate] = useState("")

    // --- États UI ---
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [errorGlobal, setErrorGlobal] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    // --- Chargement de l'employé ---
    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                setLoading(true)
                const emp = await employeeApi.getEmployeeById(employeeId)
                setLastName(emp.lastName)
                setFirstName(emp.firstName)
                setJobTitle(emp.jobTitle)
                setEmail(emp.email || "")
                setIsActive(emp.isActive)
                setEmployeeNumber(emp.employeeNumber)
                setType(emp.type)
                setHireDate(emp.hireDate)
            } catch (err) {
                setErrorGlobal("Impossible de charger l'employé.")
            } finally {
                setLoading(false)
            }
        }
        if (employeeId) fetchEmployee()
    }, [employeeId])

    // --- Handlers ---
    const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)
    const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)
    const handleJobTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => setJobTitle(e.target.value)
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)
    const handleIsActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => setIsActive(e.target.checked)

    // --- Soumission ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setErrorGlobal(null)
        setFieldErrors({})

        const payload: UpdateEmployeePayload = {
            lastName,
            firstName,
            jobTitle,
            email: email.trim() || null,
            isActive,
        }

        try {
            await employeeApi.updateEmployee(employeeId, payload)
            navigate("/employees")
        } catch (err) {
            if (err instanceof ApiError && err.status === 409) {
                setFieldErrors({ email: err.message })
            } else if (err instanceof ApiError && err.status === 400 && err.data.length > 0) {
                const mapped: Record<string, string> = {}
                ;(err.data as { field: string; message: string }[]).forEach((e) => {
                    mapped[e.field] = e.message
                })
                setFieldErrors(mapped)
            } else {
                setErrorGlobal(err instanceof ApiError ? err.message : "Une erreur est survenue.")
            }
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="create-container"><p>Chargement...</p></div>

    return (
        <div className="create-container">
            <div className="create-header">
                <div>
                    <h1>Modifier l'Employé</h1>
                    <p>Matricule : {employeeNumber || "-"}</p>
                </div>
                <Button variant="secondary" onClick={() => navigate("/employees")}>
                    Retour
                </Button>
            </div>

            <form className="create-form" onSubmit={handleSubmit}>
                {errorGlobal && <Alert type="error" onClose={() => setErrorGlobal(null)}>{errorGlobal}</Alert>}

                <div className="form-grid">
                    <Input label="Nom" value={lastName} onChange={handleLastNameChange} required error={fieldErrors.lastName} />
                    <Input label="Prénom" value={firstName} onChange={handleFirstNameChange} required error={fieldErrors.firstName} />
                    <Input label="Fonction / Poste" value={jobTitle} onChange={handleJobTitleChange} required error={fieldErrors.jobTitle} />
                    <Input label="Email" type="email" value={email} onChange={handleEmailChange} error={fieldErrors.email} />

                    {/* Champs non modifiables */}
                    <div className="field">
                        <label>Type</label>
                        <input className="field-control" value={EMPLOYEE_TYPE_LABELS[type]} disabled />
                    </div>
                    <div className="field">
                        <label>Date d'embauche</label>
                        <input className="field-control" value={hireDate} disabled />
                    </div>

                    {/* Statut actif */}
                    <div className="field field-checkbox">
                        <label>
                            <input type="checkbox" checked={isActive} onChange={handleIsActiveChange} />
                            Employé actif
                        </label>
                    </div>
                </div>

                <div className="form-actions">
                    <Button variant="secondary" type="button" onClick={() => navigate("/employees")}>Annuler</Button>
                    <Button variant="primary" type="submit" disabled={saving}>
                        {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                    </Button>
                </div>
            </form>
        </div>
    )
}