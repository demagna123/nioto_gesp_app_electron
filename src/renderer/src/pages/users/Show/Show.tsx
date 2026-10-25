import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import "../../Employees/Show/Show.css" // Réutilise le CSS de ShowEmployee/ShowTeam
import { userApi } from "@renderer/api/services/user/user"
import Button from "@renderer/components/Button/Button"
import type { User } from "@renderer/data/models/User"
import { ROLE_LABELS } from "@renderer/data/constant"

export default function ShowUser() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const userId = Number(id)

    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true)
                const data = await userApi.getUserById(userId)
                setUser(data)
            } catch (err) {
                console.error(err)
                setError("Impossible de charger les détails de l'utilisateur.")
            } finally {
                setLoading(false)
            }
        }
        if (userId) fetchUser()
    }, [userId])

    if (loading) return <div className="show-container"><p>Chargement...</p></div>
    if (error || !user) return <div className="show-container"><p>{error || "Utilisateur introuvable."}</p></div>

    return (
        <div className="show-container">
            {/* En-tête */}
            <div className="show-header">
                <div>
                    <h1>{user.firstName} {user.lastName}</h1>
                    <p>{ROLE_LABELS[user.role]}</p>
                </div>
                <div className="show-header-actions">
                    <Button variant="secondary" onClick={() => navigate("/users")}>
                        Retour
                    </Button>
                    <Button variant="primary" onClick={() => navigate(`/users/edit/${user.id}`)}>
                        Modifier
                    </Button>
                </div>
            </div>

            {/* Carte d'informations */}
            <div className="show-card">
                <div className="show-section">
                    <h2>Informations du compte</h2>
                    <div className="show-grid">
                        <div className="show-item">
                            <span className="show-label">Nom</span>
                            <span className="show-value">{user.lastName}</span>
                        </div>
                        <div className="show-item">
                            <span className="show-label">Prénom</span>
                            <span className="show-value">{user.firstName}</span>
                        </div>
                        <div className="show-item">
                            <span className="show-label">Email</span>
                            <span className="show-value">{user.email}</span>
                        </div>
                        <div className="show-item">
                            <span className="show-label">Rôle</span>
                            <span className="show-value">{ROLE_LABELS[user.role]}</span>
                        </div>
                        <div className="show-item">
                            <span className="show-label">Statut</span>
                            <span className={`status-badge ${user.isActive ? "status-active" : "status-inactive"}`}>
                                {user.isActive ? "Actif" : "Inactif"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}