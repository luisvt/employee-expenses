import type { FieldErrors, FieldValues } from "react-hook-form";

export default function ErrorMessage<T extends FieldValues>({
  errors,
  name,
}: {
  errors: FieldErrors<T>,
  name: keyof T,
}) {
  return errors[name] && <small className="p-error">{errors[name].message as string}</small>;
}
