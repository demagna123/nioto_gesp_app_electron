import { useAuth } from "../../providers/AuthContext"
import Card from "../../components/Card/Card"

export default function Home() {
    const { user, permissions } = useAuth()

    return (
        <main style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 16px" }}>
            <Card title={`Bonjour ${user?.firstName}`}>
                <p style={{ marginTop: 0 }}>
                    {permissions.length} permission(s) : {permissions.join(", ")}
                </p>
            </Card>
        </main>
    )
}