import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router"
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
} from "recharts"
import "./Dashboard.css"
import { dashboardApi, DashboardData } from "@renderer/api/services/dashboard/dashboard"
import { ApiError } from "@renderer/api/client"
import Button from "@renderer/components/Button/Button"
import Alert from "@renderer/components/Alert/Alert"
import { useAuth } from "@renderer/providers/AuthContext"

const ATTENDANCE_PATH = "/attendances" // à aligner sur la route de ton Router
const REFRESH_MS = 60000
const SHIFT_LABELS: Record<string, string> = { morning: "Matin", afternoon: "Après-midi", night: "Nuit" }
const NEUTRAL = "#d0d5dd"

// Lundi 26 octobre 2026
const todayLabel = (): string => {
    const text = new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    })
    return text.charAt(0).toUpperCase() + text.slice(1)
}

type StatCardProps = {
    title: string
    value: number
    sub: string
    tone: "primary" | "success" | "warning" | "neutral"
}

function StatCard({ title, value, sub, tone }: StatCardProps) {
    return (
        <div className={`stat-card stat-card--${tone}`}>
            <span className="stat-title">{title}</span>
            <span className="stat-value">{value}</span>
            <span className="stat-sub">{sub}</span>
        </div>
    )
}

export default function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()
    const { user } = useAuth()

    const load = useCallback(async (silent = false) => {
        try {
            setData(await dashboardApi.getStats())
            setError(null)
        } catch (err) {
            if (!silent) setError(err instanceof ApiError ? err.message : "Impossible de charger les données.")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load()
        const timer = setInterval(() => load(true), REFRESH_MS)
        return () => clearInterval(timer)
    }, [load])

    if (loading) {
        return (
            <div className="dashboard-container">
                <p>Chargement du tableau de bord...</p>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="dashboard-container">
                <Alert type="error">{error ?? "Impossible de charger les données."}</Alert>
            </div>
        )
    }

    const total = data.employees.total

       const expected = data.today.expected
    const presenceRate = expected > 0 ? Math.min(100, Math.round((data.today.present / expected) * 100)) : 0

    // Donut : si personne n'est attendu, on affiche un anneau gris plein
    const chartData =
        expected > 0
            ? [
                  { name: "Présents", value: data.today.present, color: "var(--color-success)" },
                  { name: "Non pointés", value: data.today.absent, color: NEUTRAL },
              ]
            : [{ name: "Aucun attendu", value: 1, color: NEUTRAL }]
    return (
        <div className="dashboard-container">
            {/* En-tête */}
            <div className="dashboard-header">
                <div>
                    <h1>Tableau de bord</h1>
                    <p className="dashboard-date">
                        {todayLabel()}
                        {user && ` · ${user.firstName} ${user.lastName}`}
                    </p>
                </div>
                <Button variant="primary" onClick={() => navigate(ATTENDANCE_PATH)}>
                    Aller au pointage
                </Button>
            </div>

            {error && (
                <Alert type="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Chiffres clés */}
            <div className="stats-grid">
                <StatCard
                    title="Effectif total"
                    value={data.employees.total}
                    sub={`${data.employees.administrative} administratifs · ${data.employees.worker} ouvriers`}
                    tone="primary"
                />
                <StatCard
                    title="Présents aujourd'hui"
                    value={data.today.present}
                    sub={`${data.today.presentAdministrative} administratifs · ${data.today.presentWorker} ouvriers`}
                    tone="success"
                />
                <StatCard
                    title="Non pointés"
                    value={data.today.absent}
                    sub={`${data.today.absentAdministrative} administratifs · ${data.today.absentWorker} ouvriers`}
                    tone="neutral"
                />
                <StatCard title="Équipes actives" value={data.teams} sub="Disponibles pour la programmation" tone="warning" />
            </div>

            <div className="dashboard-layout">
                {/* Taux de présence */}
                <div className="dashboard-card">
                    <h2>Taux de présence</h2>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={72}
                                    outerRadius={100}
                                    paddingAngle={total > 0 ? 3 : 0}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                                {total > 0 && (
                                    <Tooltip
                                        formatter={(value) => [`${value} employé(s)`, ""]}
                                        contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                    />
                                )}
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="donut-center-text">
                            <span className="donut-percentage">{presenceRate}%</span>
                            <span className="donut-label">de l'effectif</span>
                        </div>
                    </div>
                </div>

                {/* Poste en cours */}
                <div className="dashboard-card">
                    <h2>Poste en cours</h2>
                    {data.currentShift ? (
                        <div className="shift-info">
                            <span className="shift-name">{SHIFT_LABELS[data.currentShift.name] ?? data.currentShift.name}</span>
                            <span className="shift-hours">
                                {data.currentShift.startTime.slice(0, 5)} – {data.currentShift.endTime.slice(0, 5)}
                            </span>
                            <Button variant="secondary" onClick={() => navigate(ATTENDANCE_PATH)}>
                                Voir les ouvriers du poste
                            </Button>
                        </div>
                    ) : (
                        <p className="dashboard-muted">Aucun poste en cours actuellement.</p>
                    )}
                </div>
            </div>

            {/* Évolution */}
            <div className="dashboard-card dashboard-card--wide">
                <h2>Présences des 7 derniers jours</h2>
                <div className="chart-line">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.last7Days} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e7ec" />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#667085" }} />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                                tick={{ fontSize: 12, fill: "#667085" }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            />
                            <Legend verticalAlign="top" height={36} iconType="plainline" />
                            <Line
                                type="monotone"
                                dataKey="administrative"
                                name="Administratifs"
                                stroke="var(--color-primary)"
                                strokeWidth={2.5}
                                dot={{ r: 3 }}
                                activeDot={{ r: 5 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="worker"
                                name="Ouvriers"
                                stroke="var(--color-accent)"
                                strokeWidth={2.5}
                                dot={{ r: 3 }}
                                activeDot={{ r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}