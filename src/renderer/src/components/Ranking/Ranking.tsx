import { useEffect, useState } from "react"
import "./Ranking.css"
import { attendanceApi } from "@renderer/api/services/attendance/attendance"
import { ApiError } from "@renderer/api/client"
import type { RankingData, RankingEntry } from "@renderer/data/models/Attendance"
import type { EmployeeType } from "@renderer/data/constant"
import Card from "@renderer/components/Card/Card"
import Alert from "@renderer/components/Alert/Alert"

// 85 minutes -> "1h25"
const formatDuration = (minutes: number): string =>
    `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, "0")}`

type Props = {
    weekStartDate: string
    type?: EmployeeType
}

function RankingTable({ entries, kind }: { entries: RankingEntry[]; kind: "absent" | "late" }) {
    if (entries.length === 0) {
        return <p className="ranking-empty">{kind === "absent" ? "Aucune absence cette semaine." : "Aucun retard cette semaine."}</p>
    }

    return (
        <table className="ranking-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Employé</th>
                    {kind === "absent" ? (
                        <th className="ranking-num">Absences</th>
                    ) : (
                        <>
                            <th className="ranking-num">Retards</th>
                            <th className="ranking-num">Total</th>
                        </>
                    )}
                </tr>
            </thead>
            <tbody>
                {entries.map((entry, index) => (
                    <tr key={entry.employee.id}>
                        <td>{index + 1}</td>
                        <td>
                            <strong>{entry.employee.lastName.toUpperCase()}</strong> {entry.employee.firstName}
                            <span className="ranking-job">{entry.employee.jobTitle}</span>
                        </td>
                        {kind === "absent" ? (
                            <td className="ranking-num">{entry.absences}</td>
                        ) : (
                            <>
                                <td className="ranking-num">{entry.lates}</td>
                                <td className="ranking-num">{formatDuration(entry.lateMinutes)}</td>
                            </>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default function Ranking({ weekStartDate, type }: Props) {
    const [data, setData] = useState<RankingData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false // évite qu'une réponse en retard écrase une plus récente
        setLoading(true)
        setError(null)

        attendanceApi
            .getRanking(weekStartDate, type)
            .then((result) => {
                if (!cancelled) setData(result)
            })
            .catch((err) => {
                if (!cancelled) setError(err instanceof ApiError ? err.message : "Impossible de charger le classement.")
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [weekStartDate, type])

    if (loading) return <p>Chargement du classement…</p>
    if (error) return <Alert type="error">{error}</Alert>
    if (!data) return null

    return (
        <section className="ranking">
            <div className="ranking-grid">
                <Card title="Les plus absents">
                    <RankingTable entries={data.mostAbsent} kind="absent" />
                    <p className="ranking-note">
                        Absences confirmées à la clôture d'un poste (ouvriers). Les congés ne sont pas encore pris en compte.
                    </p>
                </Card>

                <Card title="Les plus en retard">
                    <RankingTable entries={data.mostLate} kind="late" />
                    <p className="ranking-note">
                        Retard : arrivée plus de {data.toleranceMinutes} minutes après le début du poste (8h00 pour les
                        administratifs). Le total compte les minutes depuis l'heure officielle.
                    </p>
                </Card>
            </div>
        </section>
    )
}