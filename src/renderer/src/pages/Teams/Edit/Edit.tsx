import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import "../Create/Create.css" // On réutilise le CSS de CreateTeam
import { teamApi, UpdateTeamPayload } from "@renderer/api/services/team/team"
import { ApiError } from "@renderer/api/client"
import Button from "@renderer/components/Button/Button"
import Input from "@renderer/components/Input/Input"
import Alert from "@renderer/components/Alert/Alert"
import Toggle from "@renderer/components/Toggle/Toggle"

export default function EditTeam() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const teamId = Number(id)

    // --- États des champs ---
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [isActive, setIsActive] = useState(true)

    // --- États UI ---
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [errorGlobal, setErrorGlobal] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    // --- Chargement de l'équipe ---
    useEffect(() => {
        const fetchTeam = async () => {
            try {
                setLoading(true)
                const team = await teamApi.getTeamById(teamId)
                setName(team.name)
                setDescription(team.description || "")
                setIsActive(team.isActive)
            } catch (err) {
                console.error(err)
                setErrorGlobal("Impossible de charger l'équipe.")
            } finally {
                setLoading(false)
            }
        }
        if (teamId) fetchTeam()
    }, [teamId])

    // --- Handlers ---
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)

    // --- Soumission ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setErrorGlobal(null)
        setFieldErrors({})

        const payload: UpdateTeamPayload = {
            name,
            description,
            isActive,
        }

        try {
            await teamApi.updateTeam(teamId, payload)
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
                    <h1>Modifier l'Équipe</h1>
                    <p>Modifiez les informations de l'équipe.</p>
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
                    <Button variant="primary" type="submit" disabled={saving}>
                        {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                    </Button>
                </div>
            </form>
        </div>
    )
}