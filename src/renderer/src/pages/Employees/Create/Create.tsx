import { useState } from "react"
import { useNavigate } from "react-router"
import "./Create.css"
import { CreateEmployeePayload, employeeApi } from "@renderer/api/services/employee/employee"
import Button from "@renderer/components/Button/Button"
import Input from "@renderer/components/Input/Input"
import { ApiError } from "@renderer/api/client"
import Alert from "@renderer/components/Alert/Alert"
import { EMPLOYEE_TYPE, EMPLOYEE_TYPE_LABELS, EmployeeType } from "@renderer/data/constant"

export default function CreateEmployee() {
    const navigate = useNavigate()

    // --- États pour chaque champ (ton style) ---
    const [lastName, setLastName] = useState("")
    const [firstName, setFirstName] = useState("")
    const [jobTitle, setJobTitle] = useState("")
    const [type, setType] = useState<EmployeeType>(EMPLOYEE_TYPE.WORKER)
    const [hireDate, setHireDate] = useState("")
    const [email, setEmail] = useState("")

    // --- États pour l'UI ---
    const [loading, setLoading] = useState(false)
    const [errorGlobal, setErrorGlobal] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    // --- Handlers (ton style) ---
    const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)
    const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)
    const handleJobTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => setJobTitle(e.target.value)
    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => setType(e.target.value as EmployeeType)
    const handleHireDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setHireDate(e.target.value)
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)

    // --- Soumission ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrorGlobal(null)
        setFieldErrors({})

        const payload: CreateEmployeePayload = {
            lastName,
            firstName,
            jobTitle,
            type,
            hireDate,
            email: email.trim() || null,
        }

        try {
            await employeeApi.createEmployee(payload)
            // Succès : on retourne à la liste
            navigate("/employees")
        } catch (err) {
            if (err instanceof ApiError && err.status === 409) {
                // Seul conflit possible à la création : l'e-mail déjà utilisé
                setFieldErrors({ email: err.message })
            } else if (err instanceof ApiError && err.status === 400 && err.data.length > 0) {
                // Le serveur renvoie [{ field, message }] pour les champs invalides
                const mapped: Record<string, string> = {}
                    ; (err.data as { field: string; message: string }[]).forEach((e) => {
                        mapped[e.field] = e.message
                    })
                setFieldErrors(mapped)
            } else {
                setErrorGlobal(err instanceof ApiError ? err.message : "Une erreur est survenue lors de la création.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="create-container">
            {/* En-tête */}
            <div className="create-header">
                <div>
                    <h1>Nouvel Employé</h1>
                    <p>Remplissez les informations pour créer un employé.</p>
                </div>
                <Button variant="secondary" onClick={() => navigate("/employees")}>
                    Retour
                </Button>
            </div>

            {/* Formulaire */}
            <form className="create-form" onSubmit={handleSubmit}>
                {errorGlobal && <Alert type="error" onClose={() => setErrorGlobal(null)}>{errorGlobal}</Alert>}

                <div className="form-grid">
                    <Input
                        label="Nom"
                        value={lastName}
                        onChange={handleLastNameChange}
                        required
                        error={fieldErrors.lastName}
                        placeholder="Ex: Dupont"
                    />
                    <Input
                        label="Prénom"
                        value={firstName}
                        onChange={handleFirstNameChange}
                        required
                        error={fieldErrors.firstName}
                        placeholder="Ex: Jean"
                    />
                    <Input
                        label="Fonction / Poste"
                        value={jobTitle}
                        onChange={handleJobTitleChange}
                        required
                        error={fieldErrors.jobTitle}
                        placeholder="Ex: Développeur"
                    />

                    {/* Select Type (natif stylé) */}
                    <div className="field">
                        <label htmlFor="type">
                            Type <span className="field-required">*</span>
                        </label>
                        <select
                            id="type"
                            className={`field-control ${fieldErrors.type ? "field-control-error" : ""}`}
                            value={type}
                            onChange={handleTypeChange}
                            required
                        >
                            {Object.values(EMPLOYEE_TYPE).map((value) => (
                                <option key={value} value={value}>
                                    {EMPLOYEE_TYPE_LABELS[value]}
                                </option>
                            ))}
                        </select>
                        {fieldErrors.type && <p className="field-error">{fieldErrors.type}</p>}
                    </div>

                    <Input
                        label="Date d'embauche"
                        type="date"
                        value={hireDate}
                        onChange={handleHireDateChange}
                        required
                        error={fieldErrors.hireDate}
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        error={fieldErrors.email}
                        placeholder="Ex: jean.dupont@nioto.tg"
                    />
                </div>

                {/* Actions */}
                <div className="form-actions">
                    <Button variant="secondary" type="button" onClick={() => navigate("/employes")}>
                        Annuler
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? "Création en cours..." : "Créer l'employé"}
                    </Button>
                </div>
            </form>
        </div>
    )
}