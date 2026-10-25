import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import "../../Employees/Create/Create.css" // Réutilise le CSS des formulaires
import { userApi, UpdateUserPayload } from "@renderer/api/services/user/user"
import { ApiError } from "@renderer/api/client"
import Button from "@renderer/components/Button/Button"
import Input from "@renderer/components/Input/Input"
import Alert from "@renderer/components/Alert/Alert"
import Toggle from "@renderer/components/Toggle/Toggle"
import { USER_ROLE, ROLE_LABELS, UserRole } from "@renderer/data/constant"

export default function EditUser() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const userId = Number(id)

    // --- États des champs ---
    const [lastName, setLastName] = useState("")
    const [firstName, setFirstName] = useState("")
    const [email, setEmail] = useState("")
    const [role, setRole] = useState<UserRole>(USER_ROLE.ADMIN)
    const [isActive, setIsActive] = useState(true)

    // --- États UI ---
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [errorGlobal, setErrorGlobal] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    // --- Chargement de l'utilisateur ---
    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true)
                const user = await userApi.getUserById(userId)
                setLastName(user.lastName)
                setFirstName(user.firstName)
                setEmail(user.email)
                setRole(user.role)
                setIsActive(user.isActive)
            } catch (err) {
                console.error(err)
                setErrorGlobal("Impossible de charger l'utilisateur.")
            } finally {
                setLoading(false)
            }
        }
        if (userId) fetchUser()
    }, [userId])

    // --- Handlers ---
    const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)
    const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)
    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value as UserRole)

    // --- Soumission ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setErrorGlobal(null)
        setFieldErrors({})

        const payload: UpdateUserPayload = {
            lastName,
            firstName,
            email,
            role,
            isActive,
        }

        try {
            await userApi.updateUser(userId, payload)
            navigate("/users")
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
            {/* En-tête */}
            <div className="create-header">
                <div>
                    <h1>Modifier l'Utilisateur</h1>
                    <p>Modifiez les informations du compte.</p>
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
                    />
                    <Input
                        label="Prénom"
                        value={firstName}
                        onChange={handleFirstNameChange}
                        required
                        error={fieldErrors.firstName}
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        required
                        error={fieldErrors.email}
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

                    {/* Statut actif avec Toggle */}
                    <div className="field field-toggle">
                        <label>Statut du compte</label>
                        <div className="toggle-wrapper">
                            <Toggle
                                checked={isActive}
                                onChange={setIsActive}
                                label="Activer ou désactiver le compte"
                            />
                            <span className="toggle-label-text">
                                {isActive ? "Actif" : "Inactif"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="form-actions">
                    <Button variant="secondary" type="button" onClick={() => navigate("/users")}>
                        Annuler
                    </Button>
                    <Button variant="primary" type="submit" disabled={saving}>
                        {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                    </Button>
                </div>
            </form>
        </div>
    )
}