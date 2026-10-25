import { useState } from "react"
import type { FormEvent } from "react"
import { Navigate, useLocation, useNavigate } from "react-router"
import logo from "../../assets/logo.jpg"
import "./Login.css"
import { useAuth } from "../../providers/AuthContext"
import { ApiError } from "../../api/client"
import Card from "../../components/Card/Card"
import Alert from "../../components/Alert/Alert"
import Input from "../../components/Input/Input"
import Button from "../../components/Button/Button"

export default function Login() {
    const { user, login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const from = (location.state as { from?: string } | null)?.from ?? "/home"

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Déjà connecté : inutile de rester ici
    if (user) return <Navigate to="/" replace />

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            await login(email.trim(), password)
            navigate(from, { replace: true })
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Une erreur est survenue.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="login-page">
            <div className="login-brand">
                <img src={logo} alt="Nioto" className="login-logo" />
                <h1 className="login-title">Connexion</h1>
            </div>

            <Card className="login-card">
                {error && (
                    <Alert type="error" onClose={() => setError("")}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Input
                        label="Adresse e-mail"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                        label="Mot de passe"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button type="submit" size="lg" loading={loading}>
                        Se connecter
                    </Button>
                </form>
            </Card>
        </main>
    )
}