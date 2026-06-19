import { fieldClass, labelClass } from "./styles";

type FormDateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  min?: string;
};

export function FormDateField({
  label,
  value,
  onChange,
  error,
  min,
}: FormDateFieldProps) {
  return (
    <label>
      <span className={labelClass}>{label}</span>
      <input
        type="date"
        className={fieldClass(Boolean(error))}
        value={value}
        min={min}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </label>
  );
}
