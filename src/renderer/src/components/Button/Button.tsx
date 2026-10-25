import type { ButtonHTMLAttributes, ReactNode } from "react"
import "./Button.css"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "danger"
    size?: "md" | "lg"
    loading?: boolean
    children: ReactNode
}

export default function Button({
    variant = "primary",
    size = "md",
    loading = false,
    disabled,
    children,
    className = "",
    type = "button",
    ...rest
}: ButtonProps) {
    return (
        <button
            type={type}
            className={`btn btn-${variant} btn-${size} ${className}`.trim()}
            disabled={disabled || loading}
            {...rest}
        >
            {loading ? "Veuillez patienter…" : children}
        </button>
    )
}