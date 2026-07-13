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
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </label>
  );
}
