import { NavLink } from "react-router"
import "./SideBar.css"
import { useAuth } from "../../providers/AuthContext"
import type { PermissionCode } from "../../data/constant"

type NavItem = {
    to: string
    label: string
    permission?: PermissionCode
}

// Tes liens rangés dans l'ordre logique
const LINKS: NavItem[] = [
    { to: "/dashboard", label: "Tableau de bord" },
    { to: "/users", label: "Gestion Utilisateurs" },
    { to: "/employees", label: "Gestion Employés" },
    { to: "/attendances", label: "Pointage" },
    { to: "/schedules", label: "Programmation des équipes" },
    { to: "/shifts", label: "Postes" },
    { to: "/teams", label: "Gestion d'Équipes" },
    { to: "/report", label: "Rapport" },
    { to: "/parametres", label: "Paramètres" },
    { to: "/permissions", label: "Gestion Permissions" },
]

export default function SideBar() {
    const { user, hasPermission } = useAuth()

    if (!user) return null

    // Filtrage selon les permissions
    const links = LINKS.filter((link) => !link.permission || hasPermission(link.permission))

    return (
        <aside className="sidebar">
            <nav className="sidebar-nav" aria-label="Menu latéral">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => 
                            isActive ? "sidebar-link sidebar-link-active" : "sidebar-link"
                        }
                    >
                        {link.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    )
}