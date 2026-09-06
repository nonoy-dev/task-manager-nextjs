import { useId } from "react";
import { fieldClass, labelClass } from "./formFieldStyles";

type FormTextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  maxLength?: number;
  placeholder?: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  name?: string;
};

export function FormTextField({
  label,
  value,
  onChange,
  error,
  maxLength,
  placeholder,
  type = "text",
  autoComplete,
  name,
}: FormTextFieldProps) {
  const errorId = useId();

  return (
    <label>
      <span className={labelClass}>{label}</span>
      <input
        type={type}
        name={name}
        autoComplete={autoComplete}
        className={fieldClass(Boolean(error))}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </label>
  );
}
