import { Navigate, Outlet, useLocation } from "react-router"
import { useAuth } from "../../providers/AuthContext"

export default function ProtectedRoute() {
    const { user } = useAuth()
    const location = useLocation()

    // Non connecté : on va à la connexion, en retenant la page demandée
    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />
    }

    return <Outlet />
}