import { useState } from "react"
import "./Create.css"
import { CreateTeamPayload, teamApi } from "@renderer/api/services/team/team"
import { ApiError } from "@renderer/api/client"
import { useNavigate } from "react-router"
import Button from "@renderer/components/Button/Button"
import Input from "@renderer/components/Input/Input"
import Alert from "@renderer/components/Alert/Alert"
import Toggle from "@renderer/components/Toggle/Toggle" // Adapte le chemin si besoin

export default function CreateTeam() {
    const navigate = useNavigate()

    const [name, setName] = useState<string>("")
    const [description, setDescription] = useState<string>("")
    const [isActive, setIsActive] = useState<boolean>(true)

    // --- États pour l'UI ---
    const [loading, setLoading] = useState(false)
    const [errorGlobal, setErrorGlobal] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    // --- Handlers ---
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrorGlobal(null)
        setFieldErrors({})

        const payload: CreateTeamPayload = {
            name,
            description,
            isActive,
        }

        try {
            await teamApi.createTeam(payload)
            navigate("/teams")
        } catch (err) {
            if (err instanceof ApiError && err.status === 409) {
                setFieldErrors({ name: err.message })
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
                    <h1>Nouvelle Équipe</h1>
                    <p>Remplissez les informations pour créer une équipe.</p>
                </div>
                <Button variant="secondary" onClick={() => navigate("/teams")}>
                    Retour
                </Button>
            </div>

            {/* Formulaire */}
            <form className="create-form" onSubmit={handleSubmit}>
                {errorGlobal && <Alert type="error" onClose={() => setErrorGlobal(null)}>{errorGlobal}</Alert>}

                <div className="form-grid">
                    <Input
                        label="Nom de l'équipe"
                        value={name}
                        onChange={handleNameChange}
                        required
                        error={fieldErrors.name}
                        placeholder="Ex: Équipe A"
                    />
                    <Input
                        label="Description"
                        value={description}
                        onChange={handleDescriptionChange}
                        error={fieldErrors.description}
                        placeholder="Ex: Équipe de production du matin"
                    />

                    {/* Statut actif avec Toggle */}
                    <div className="field field-toggle">
                        <label>Statut de l'équipe</label>
                        <div className="toggle-wrapper">
                            <Toggle
                                checked={isActive}
                                onChange={setIsActive}
                                label="Rendre l'équipe active"
                            />
                            <span className="toggle-label-text">
                                {isActive ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="form-actions">
                    <Button variant="secondary" type="button" onClick={() => navigate("/teams")}>
                        Annuler
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? "Création en cours..." : "Créer l'équipe"}
                    </Button>
                </div>
            </form>
        </div>
    )
}