import { inputClass, labelClass } from "./formFieldStyles";

type FormSelectProps<T extends string> = {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
};

export function FormSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: FormSelectProps<T>) {
  return (
    <label>
      <span className={labelClass}>{label}</span>
      <select
        className={inputClass}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
