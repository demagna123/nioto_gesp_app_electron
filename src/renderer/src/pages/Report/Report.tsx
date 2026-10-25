import { Fragment, useState } from "react"
import "./Report.css"
import { attendanceApi } from "@renderer/api/services/attendance/attendance"
import { ApiError } from "@renderer/api/client"
import type { ReportData } from "@renderer/data/models/Attendance"
import { EMPLOYEE_TYPE, EMPLOYEE_TYPE_LABELS } from "@renderer/data/constant"
import type { EmployeeType } from "@renderer/data/constant"
import Button from "@renderer/components/Button/Button"
import Alert from "@renderer/components/Alert/Alert"
import Ranking from "@renderer/components/Ranking/Ranking"

// Largeurs des colonnes en % : N°Mle, NOMS, PRENOMS, puis 7 jours x (début, fin)
// (proportions de la feuille Excel : 5,4 / 16 / 19,7 / 7,3 / 7,9 / 7,3...)
const COLUMN_WIDTHS = [9.5, 10.5, 13.0, 5.0, 5.0, ...Array(12).fill(5.0)]

// 2026-10-12 -> 12/10/2026
const formatDate = (dateStr: string): string => {
    const [year, month, day] = dateStr.split("-")
    return `${day}/${month}/${year}`
}
// LISTE DE PRESENCE DU 12-10-2026 AU 18-10-2026.pdf
const pdfFileName = (data: ReportData): string => {
    const dmy = (d: string) => d.split("-").reverse().join("-")
    return `LISTE DE PRESENCE DU ${dmy(data.weekStartDate)} AU ${dmy(data.weekEndDate)}.pdf`
}

// 24 Octobre 2026 (mois en toutes lettres, avec une majuscule, comme dans leur fichier)
const formatLongDate = (date: Date): string =>
    date
        .toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" })
        .replace(/ (\p{L})/u, (_, letter: string) => ` ${letter.toUpperCase()}`)

const NBSP = "\u00A0" // espaces insécables : ils ne sont pas réduits à un seul par le navigateur

export default function Report() {
    // N'importe quelle date de la semaine : le serveur trouve le début de semaine
    const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0])
    const [typeFilter, setTypeFilter] = useState<"all" | EmployeeType>("all")
    const [reportData, setReportData] = useState<ReportData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [exporting, setExporting] = useState(false)
    const [info, setInfo] = useState<string | null>(null)
    const [reportType, setReportType] = useState<"all" | EmployeeType>("all")
    const handleGenerate = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await attendanceApi.getWeeklyReport(date, typeFilter === "all" ? undefined : typeFilter)
            setReportData(data)
            setReportType(typeFilter)
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Impossible de générer le rapport.")
        } finally {
            setLoading(false)
        }
    }

    const handleExportPdf = async () => {
        if (!reportData) return
        setExporting(true)
        setError(null)
        setInfo(null)
        try {
            const result = await window.api.exportReportPdf(pdfFileName(reportData))
            if (result.ok) setInfo(`PDF enregistré : ${result.filePath}`)
            else if (!result.canceled) setError(result.error ?? "Impossible de créer le PDF.")
        } catch {
            setError("Impossible de créer le PDF.")
        } finally {
            setExporting(false)
        }
    }

    return (
        <div className="report-container">
            {/* Commandes (masquées à l'impression) */}
            <div className="report-header no-print">
                <h1>Rapport de présence</h1>
                <div className="report-controls">
                    <div className="field">
                        <label>Une date de la semaine</label>
                        <input
                            type="date"
                            className="field-control"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div className="field">
                        <label>Personnel</label>
                        <select
                            className="field-control"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as "all" | EmployeeType)}
                        >
                            <option value="all">Tous</option>
                            {Object.values(EMPLOYEE_TYPE).map((value) => (
                                <option key={value} value={value}>
                                    {EMPLOYEE_TYPE_LABELS[value]}s
                                </option>
                            ))}
                        </select>
                    </div>
                    <Button variant="primary" onClick={handleGenerate} loading={loading}>
                        Générer le rapport
                    </Button>
                    {reportData && (
                        <>
                            <Button variant="secondary" onClick={handleExportPdf} loading={exporting}>
                                Télécharger PDF
                            </Button>
                            <Button variant="secondary" onClick={() => window.print()}>
                                Imprimer
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="no-print">
                {error && (
                    <Alert type="error" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}
                {info && (
                    <Alert type="success" onClose={() => setInfo(null)}>
                        {info}
                    </Alert>
                )}
            </div>

            
            {/* Le document : même mise en page que la feuille Excel des RH */}
            {reportData && (
                <div className="report-document">
                    <div className="report-sheet">
                        <table className="report-table">
                            <colgroup>
                                {COLUMN_WIDTHS.map((width, index) => (
                                    <col key={index} style={{ width: `${width}%` }} />
                                ))}
                            </colgroup>

                            <thead>
                                {/* Ligne 1 : titre à gauche, semaine à droite */}
                                <tr className="row-title">
                                    <th colSpan={5} className="cell-title">
                                        {`LISTE DE PRESENCE${NBSP}${NBSP}${NBSP}NIOTO`}
                                    </th>
                                    <th className="cell-blank"></th>
                                    <th colSpan={11} className="cell-week">
                                        {`Semaine du ${formatDate(reportData.weekStartDate)}${NBSP}${NBSP}AU${NBSP}${NBSP}${formatDate(reportData.weekEndDate)}`}
                                    </th>
                                </tr>

                                {/* Ligne 2 : bandeau */}
                                <tr className="row-banner">
                                    <th colSpan={17} className="cell-banner">
                                        LISTE DE PRESENCE
                                    </th>
                                </tr>

                                {/* Ligne 3 : noms des jours */}
                                <tr className="row-days">
                                    <th colSpan={3} className="cell-label">
                                        SEMAINE DU …………………………….
                                    </th>
                                    {reportData.days.map((day) => (
                                        <th key={day.date} colSpan={2} className="cell-day">
                                            {day.dayName}
                                        </th>
                                    ))}
                                </tr>

                                {/* Ligne 4 : numéros des jours */}
                                <tr className="row-numbers">
                                    <th colSpan={3} className="cell-days-label">
                                        JOURS
                                    </th>
                                    {reportData.days.map((day) => (
                                        <th key={day.date} colSpan={2} className="cell-day-number">
                                            {day.dayNumber}
                                        </th>
                                    ))}
                                </tr>

                                {/* Ligne 5 : colonnes */}
                                <tr className="row-columns">
                                    <th className="cell-head-left">N°Mle</th>
                                    <th className="cell-head-left">NOMS</th>
                                    <th className="cell-head-left">PRENOMS</th>
                                    {reportData.days.map((day) => (
                                        <Fragment key={day.date}>
                                            <th className="cell-head-time">début</th>
                                            <th className="cell-head-time">fin</th>
                                        </Fragment>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {reportData.report.map((row, index) => (
                                    <tr key={row.employee.id}>
                                        <td className="cell-num">{row.employee.employeeNumber}</td>
                                        <td className="cell-name">{row.employee.lastName.toUpperCase()}</td>
                                        <td className="cell-firstname">{row.employee.firstName}</td>
                                        {row.daily.map((day) => (
                                            <Fragment key={day.date}>
                                                <td className="cell-time">{day.debut}</td>
                                                <td className="cell-time">{day.fin}</td>
                                            </Fragment>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <p className="report-footer">Fait à Lomé, le {formatLongDate(new Date())}</p>
                    </div>
                </div>
            )}

            {reportData && (
                <div className="no-print">
                    <Ranking weekStartDate={reportData.weekStartDate} type={reportType === "all" ? undefined : reportType} />
                </div>
            )}
        </div>
    )
}