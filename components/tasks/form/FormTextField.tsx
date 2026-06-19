import { fieldClass, labelClass } from "./styles";

type FormTextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  maxLength?: number;
  placeholder?: string;
};

export function FormTextField({
  label,
  value,
  onChange,
  error,
  maxLength,
  placeholder,
}: FormTextFieldProps) {
  return (
    <label>
      <span className={labelClass}>{label}</span>
      <input
        type="text"
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
