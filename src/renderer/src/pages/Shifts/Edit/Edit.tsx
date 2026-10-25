import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import "../../Employees/Create/Create.css" // Réutilise le CSS des formulaires
import { shiftApi, UpdateShiftPayload } from "@renderer/api/services/shift/shift"
import { ApiError } from "@renderer/api/client"
import Button from "@renderer/components/Button/Button"
import Input from "@renderer/components/Input/Input"
import Alert from "@renderer/components/Alert/Alert"
import Toggle from "@renderer/components/Toggle/Toggle"

const SHIFT_LABELS: Record<string, string> = {
    morning: "Matin",
    afternoon: "Après-midi",
    night: "Nuit",
}

export default function EditShift() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const shiftId = Number(id)

    // --- États des champs ---
    const [shiftName, setShiftName] = useState("")
    const [startTime, setStartTime] = useState("")
    const [endTime, setEndTime] = useState("")
    const [crossesMidnight, setCrossesMidnight] = useState(false)
    const [isActive, setIsActive] = useState(true)

    // --- États UI ---
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [errorGlobal, setErrorGlobal] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    // --- Chargement ---
    useEffect(() => {
        const fetchShift = async () => {
            try {
                setLoading(true)
                const shift = await shiftApi.getShiftById(shiftId)
                setShiftName(shift.name)
                setStartTime(shift.startTime)
                setEndTime(shift.endTime)
                setCrossesMidnight(shift.crossesMidnight)
                setIsActive(shift.isActive)
            } catch (err) {
                console.error(err)
                setErrorGlobal("Impossible de charger le poste.")
            } finally {
                setLoading(false)
            }
        }
        if (shiftId) fetchShift()
    }, [shiftId])

    // --- Handlers ---
    const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => setStartTime(e.target.value)
    const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => setEndTime(e.target.value)

    // --- Soumission ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setErrorGlobal(null)
        setFieldErrors({})

        // Le back attend "HH:MM:SS", le input type="time" renvoie "HH:MM"
        // On ajoute ":00" si besoin
        const formatTime = (t: string) => t.length === 5 ? `${t}:00` : t

        const payload: UpdateShiftPayload = {
            startTime: formatTime(startTime),
            endTime: formatTime(endTime),
            crossesMidnight,
            isActive,
        }

        try {
            await shiftApi.updateShift(shiftId, payload)
            navigate("/shifts")
        } catch (err) {
            if (err instanceof ApiError && err.status === 400 && err.data.length > 0) {
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
                    <h1>Modifier le Poste</h1>
                    <p>Poste : {SHIFT_LABELS[shiftName] || shiftName}</p>
                </div>
                <Button variant="secondary" onClick={() => navigate("/shifts")}>
                    Retour
                </Button>
            </div>

            {/* Formulaire */}
            <form className="create-form" onSubmit={handleSubmit}>
                {errorGlobal && <Alert type="error" onClose={() => setErrorGlobal(null)}>{errorGlobal}</Alert>}

                <div className="form-grid">
                    <Input
                        label="Heure de début"
                        type="time"
                        value={startTime}
                        onChange={handleStartTimeChange}
                        required
                        error={fieldErrors.startTime}
                    />
                    <Input
                        label="Heure de fin"
                        type="time"
                        value={endTime}
                        onChange={handleEndTimeChange}
                        required
                        error={fieldErrors.endTime}
                    />

                    {/* Traverse minuit */}
                    <div className="field field-toggle">
                        <label>Traverse minuit</label>
                        <div className="toggle-wrapper">
                            <Toggle
                                checked={crossesMidnight}
                                onChange={setCrossesMidnight}
                                label="Le poste traverse minuit"
                            />
                            <span className="toggle-label-text">
                                {crossesMidnight ? "Oui" : "Non"}
                            </span>
                        </div>
                    </div>

                    {/* Statut actif */}
                    <div className="field field-toggle">
                        <label>Statut du poste</label>
                        <div className="toggle-wrapper">
                            <Toggle
                                checked={isActive}
                                onChange={setIsActive}
                                label="Activer ou désactiver le poste"
                            />
                            <span className="toggle-label-text">
                                {isActive ? "Actif" : "Inactif"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="form-actions">
                    <Button variant="secondary" type="button" onClick={() => navigate("/shifts")}>
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