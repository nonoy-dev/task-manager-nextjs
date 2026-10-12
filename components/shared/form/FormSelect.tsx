import { useId } from "react";
import { fieldClass, labelClass } from "./formFieldStyles";

type FormSelectProps<T extends string> = {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
  error?: string;
};

export function FormSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  error,
}: FormSelectProps<T>) {
  const errorId = useId();

  return (
    <label>
      <span className={labelClass}>{label}</span>
      <select
        className={fieldClass(Boolean(error))}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={errorId} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </label>
  );
}
