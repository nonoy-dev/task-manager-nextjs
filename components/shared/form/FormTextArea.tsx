import { useId } from "react";
import { fieldClass, labelClass } from "./formFieldStyles";

type FormTextAreaProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  rows?: number;
  maxLength?: number;
};

export function FormTextArea({
  label,
  value,
  onChange,
  error,
  rows = 3,
  maxLength,
}: FormTextAreaProps) {
  const errorId = useId();

  return (
    <label>
      <span className={labelClass}>{label}</span>
      <textarea
        className={fieldClass(Boolean(error))}
        rows={rows}
        value={value}
        maxLength={maxLength}
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
