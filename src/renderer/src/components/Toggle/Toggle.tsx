import type { InputHTMLAttributes } from "react"
import "./Toggle.css"

type ToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "checked" | "onChange"> & {
    checked: boolean
    onChange: (checked: boolean) => void
    label: string // lu par les lecteurs d'écran, ex. "Pointer Kodjo Test"
}

export default function Toggle({ checked, onChange, label, disabled, className = "", ...rest }: ToggleProps) {
    return (
        <label className={`toggle ${disabled ? "toggle-disabled" : ""} ${className}`.trim()}>
            <input
                type="checkbox"
                role="switch"
                className="toggle-input"
                checked={checked}
                disabled={disabled}
                aria-label={label}
                onChange={(e) => onChange(e.target.checked)}
                {...rest}
            />
            <span className="toggle-track">
                <span className="toggle-handle" />
            </span>
        </label>
    )
}