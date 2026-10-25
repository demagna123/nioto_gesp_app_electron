import { useEffect, useState, useMemo } from "react"
import "./Permissions.css"
import { userApi } from "@renderer/api/services/user/user"
import { permissionApi } from "@renderer/api/services/permission/permission"
import type { User } from "@renderer/data/models/User"
import type { Permission } from "@renderer/data/models/Permission"
import Toggle from "@renderer/components/Toggle/Toggle"
import Button from "@renderer/components/Button/Button"
import Alert from "@renderer/components/Alert/Alert"

// Catégories basées sur le préfixe du code
const getCategory = (code: string): string => {
    if (code.startsWith("attendance.")) return "pointage"
    if (code.startsWith("schedule.")) return "planning"
    if (code.startsWith("employee.")) return "employes"
    if (code.startsWith("team.")) return "equipes"
    if (code.startsWith("report.")) return "rapports"
    if (code.startsWith("user.") || code.startsWith("permission.") || code.startsWith("history.")) return "administration"
    return "autre"
}

const CATEGORY_LABELS: Record<string, string> = {
    all: "Tous",
    pointage: "Pointage",
    planning: "Planning",
    employes: "Employés",
    equipes: "Équipes",
    rapports: "Rapports",
    administration: "Administration",
}

export default function Permissions() {
    const [users, setUsers] = useState<User[]>([])
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [permissions, setPermissions] = useState<Permission[]>([])
    const [loadingUsers, setLoadingUsers] = useState(true)
    const [loadingPerms, setLoadingPerms] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [category, setCategory] = useState<string>("all")

    // Charger les utilisateurs au montage
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoadingUsers(true)
                const data = await userApi.getUsers()
                setUsers(data)
            } catch (err) {
                console.error(err)
                setError("Impossible de charger les utilisateurs.")
            } finally {
                setLoadingUsers(false)
            }
        }
        fetchUsers()
    }, [])

    // Charger les permissions quand on sélectionne un utilisateur
    useEffect(() => {
        if (!selectedUser) return
        const fetchPerms = async () => {
            try {
                setLoadingPerms(true)
                const data = await permissionApi.getUserPermissions(selectedUser.id)
                setPermissions(data)
            } catch (err) {
                console.error(err)
                setError("Impossible de charger les permissions de cet utilisateur.")
            } finally {
                setLoadingPerms(false)
            }
        }
        fetchPerms()
    }, [selectedUser])

    // Filtrer par catégorie
    const filteredPermissions = useMemo(() => {
        if (category === "all") return permissions
        return permissions.filter((p) => getCategory(p.code) === category)
    }, [permissions, category])

    // Toggle une permission
    const handleToggle = (permissionId: number, checked: boolean) => {
        setPermissions((prev) =>
            prev.map((p) => (p.id === permissionId ? { ...p, isGranted: checked } : p))
        )
    }

    // Tout accorder (toutes les permissions)
    const handleGrantAll = () => {
        setPermissions((prev) => prev.map((p) => ({ ...p, isGranted: true })))
    }

    // Tout retirer (toutes les permissions)
    const handleRevokeAll = () => {
        setPermissions((prev) => prev.map((p) => ({ ...p, isGranted: false })))
    }

    // Enregistrer
    const handleSave = async () => {
        if (!selectedUser) return
        setSaving(true)
        setError(null)
        setSuccess(null)
        try {
            const payload = permissions.map((p) => ({
                permissionId: p.id,
                isGranted: !!p.isGranted,
            }))
            await permissionApi.updateUserPermissions(selectedUser.id, payload)
            setSuccess("Permissions enregistrées avec succès.")
        } catch (err) {
            console.error(err)
            setError("Erreur lors de l'enregistrement des permissions.")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="perms-container">
            <div className="perms-header">
                <h1>Gestion des Permissions</h1>
                <p>Sélectionnez un utilisateur, puis accordez ou retirez ses droits.</p>
            </div>

            {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}
            {success && <Alert type="success" onClose={() => setSuccess(null)}>{success}</Alert>}

            <div className="perms-layout">
                {/* Colonne gauche : Utilisateurs */}
                <div className="perms-users">
                    <h2>Utilisateurs</h2>
                    {loadingUsers ? (
                        <p>Chargement...</p>
                    ) : (
                        <ul className="users-list">
                            {users.map((u) => (
                                <li
                                    key={u.id}
                                    className={`user-item ${selectedUser?.id === u.id ? "user-item-active" : ""}`}
                                    onClick={() => setSelectedUser(u)}
                                >
                                    <span className="user-name">{u.firstName} {u.lastName}</span>
                                    <span className="user-email">{u.email}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Colonne droite : Permissions */}
                <div className="perms-right">
                    {!selectedUser ? (
                        <div className="perms-placeholder">
                            <p>Sélectionnez un utilisateur à gauche pour gérer ses permissions.</p>
                        </div>
                    ) : (
                        <>
                            {/* Filtres catégories */}
                            <div className="perms-filters">
                                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                    <button
                                        key={key}
                                        className={`filter-btn ${category === key ? "active" : ""}`}
                                        onClick={() => setCategory(key)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* Liste des permissions */}
                            {loadingPerms ? (
                                <p>Chargement...</p>
                            ) : (
                                <div className="perms-list">
                                    {filteredPermissions.map((p) => (
                                        <div key={p.id} className="perm-row">
                                            <div className="perm-info">
                                                <span className="perm-desc">{p.description}</span>
                                                <span className="perm-code">{p.code}</span>
                                            </div>
                                            <Toggle
                                                checked={!!p.isGranted}
                                                onChange={(checked) => handleToggle(p.id, checked)}
                                                label={`Accorder ${p.description}`}
                                            />
                                        </div>
                                    ))}
                                    {filteredPermissions.length === 0 && (
                                        <p className="perms-empty">Aucune permission dans cette catégorie.</p>
                                    )}
                                </div>
                            )}

                            {/* Boutons en bas */}
                            <div className="perms-actions">
                                <div className="perms-actions-left">
                                    <Button variant="secondary" onClick={handleGrantAll} disabled={saving}>
                                        Tout accorder
                                    </Button>
                                    <Button variant="secondary" onClick={handleRevokeAll} disabled={saving}>
                                        Tout retirer
                                    </Button>
                                </div>
                                <Button variant="primary" onClick={handleSave} disabled={saving}>
                                    {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}