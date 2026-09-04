import { useId } from "react";
import { fieldClass, labelClass } from "./formFieldStyles";

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
  const errorId = useId();

  return (
    <label>
      <span className={labelClass}>{label}</span>
      <input
        type="date"
        className={fieldClass(Boolean(error))}
        value={value}
        min={min}
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
