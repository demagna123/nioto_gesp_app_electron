import type { HTMLAttributes, ReactNode } from "react"
import "./Card.css"

type CardProps = HTMLAttributes<HTMLDivElement> & {
    title?: string
    action?: ReactNode // ex. un bouton affiché à droite du titre
    children: ReactNode
}

export default function Card({ title, action, children, className = "", ...rest }: CardProps) {
    return (
        <section className={`card ${className}`.trim()} {...rest}>
            {(title || action) && (
                <header className="card-header">
                    {title && <h2 className="card-title">{title}</h2>}
                    {action}
                </header>
            )}
            <div className="card-body">{children}</div>
        </section>
    )
}