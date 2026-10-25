import { useState } from "react"
import { useNavigate } from "react-router"
import "../../Employees/Create/Create.css" // Réutilise le CSS des autres formulaires
import { userApi, CreateUserPayload } from "@renderer/api/services/user/user"
import { ApiError } from "@renderer/api/client"
import Button from "@renderer/components/Button/Button"
import Input from "@renderer/components/Input/Input"
import Alert from "@renderer/components/Alert/Alert"
import Toggle from "@renderer/components/Toggle/Toggle"
import { USER_ROLE, ROLE_LABELS, UserRole } from "@renderer/data/constant"

export default function CreateUser() {
    const navigate = useNavigate()

    // --- États des champs ---
    const [lastName, setLastName] = useState("")
    const [firstName, setFirstName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState<UserRole>(USER_ROLE.ADMIN)

    // --- États UI ---
    const [loading, setLoading] = useState(false)
    const [errorGlobal, setErrorGlobal] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    // --- Handlers ---
    const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)
    const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)
    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value as UserRole)

    // --- Soumission ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrorGlobal(null)
        setFieldErrors({})

        const payload: CreateUserPayload = {
            lastName,
            firstName,
            email,
            password,
            role,
        }

        try {
            await userApi.createUser(payload)
            navigate("/users")
        } catch (err) {
            if (err instanceof ApiError && err.status === 409) {
                // Email déjà utilisé
                setFieldErrors({ email: err.message })
            } else if (err instanceof ApiError && err.status === 400 && err.data.length > 0) {
                const mapped: Record<string, string> = {}
                ;(err.data as { field: string; message: string }[]).forEach((e) => {
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
                    <h1>Nouvel Utilisateur</h1>
                    <p>Remplissez les informations pour créer un compte utilisateur.</p>
                </div>
                <Button variant="secondary" onClick={() => navigate("/users")}>
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
                        label="Email"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        required
                        error={fieldErrors.email}
                        placeholder="Ex: jean.dupont@nioto.tg"
                    />
                    <Input
                        label="Mot de passe"
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                        error={fieldErrors.password}
                        placeholder="8 à 72 caractères"
                    />

                    {/* Select Rôle */}
                    <div className="field">
                        <label htmlFor="role">
                            Rôle <span className="field-required">*</span>
                        </label>
                        <select
                            id="role"
                            className={`field-control ${fieldErrors.role ? "field-control-error" : ""}`}
                            value={role}
                            onChange={handleRoleChange}
                            required
                        >
                            {Object.values(USER_ROLE).map((value) => (
                                <option key={value} value={value}>
                                    {ROLE_LABELS[value]}
                                </option>
                            ))}
                        </select>
                        {fieldErrors.role && <p className="field-error">{fieldErrors.role}</p>}
                    </div>
                </div>

                {/* Actions */}
                <div className="form-actions">
                    <Button variant="secondary" type="button" onClick={() => navigate("/users")}>
                        Annuler
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? "Création en cours..." : "Créer l'utilisateur"}
                    </Button>
                </div>
            </form>
        </div>
    )
}