import { Outlet } from "react-router"
import AuthProvider from "../../providers/AuthProvider"
import { useAuth } from "../../providers/AuthContext"
import Navbar from "../NavBar/NavBar"
import SideBar from "../SideBar/SideBar"
import "./Layout.css"

function Shell() {
    const { user } = useAuth()

    return (
        <>
            <Navbar />
            <div className="layout-body">
                <SideBar />
                {/* Connecté : on laisse la place à la barre latérale. Sinon (connexion) : pleine largeur. */}
                <div className={user ? "layout-main" : "layout-public"}>
                    <Outlet />
                </div>
            </div>
        </>
    )
}

export default function Layout() {
    return (
        <AuthProvider>
            <Shell />
        </AuthProvider>
    )
}