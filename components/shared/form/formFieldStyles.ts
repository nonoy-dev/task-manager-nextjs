export const labelClass = "block text-sm font-medium";
export const inputClass =
  "mt-1 w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-sm";
const inputErrorClass = "border-red-500";

export function fieldClass(hasError: boolean): string {
  return hasError ? `${inputClass} ${inputErrorClass}` : inputClass;
}
