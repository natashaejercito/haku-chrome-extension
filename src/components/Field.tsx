import { useId } from "react";
import "./Field.css";

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  variant?: "default" | "mono" | "deadline";
};

export default function Field({
  label,
  value,
  onChange,
  placeholder,
  variant = "default",
}: FieldProps) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      <input
        id={id}
        className={`field__input field__input--${variant}`}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
