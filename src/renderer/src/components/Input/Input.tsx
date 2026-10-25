import { useId } from "react"
import type { InputHTMLAttributes } from "react"
import "./Input.css"

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string
    error?: string
}

export default function Input({ label, error, className = "", ...rest }: InputProps) {
    const id = useId()
    return (
        <div className="field">
            <label htmlFor={id}>
                {label}
                {rest.required && <span className="field-required"> *</span>}
            </label>
            <input
                id={id}
                className={`field-control ${error ? "field-control-error" : ""} ${className}`.trim()}
                aria-invalid={!!error}
                {...rest}
            />
            {error && <p className="field-error">{error}</p>}
        </div>
    )
}