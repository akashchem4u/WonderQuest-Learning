import type { ChangeEventHandler, ReactNode } from "react";

type CardProps = {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
};

export function ShellCard({ title, eyebrow, children, className }: CardProps) {
  return (
    <section className={`shell-card ${className ?? ""}`.trim()}>
      {eyebrow ? <span className="shell-eyebrow">{eyebrow}</span> : null}
      <h2>{title}</h2>
      {children}
    </section>
  );
}

type StatProps = {
  label: string;
  value: string;
  detail?: string;
  className?: string;
};

export function StatTile({ label, value, detail, className }: StatProps) {
  return (
    <article className={`stat-tile ${className ?? ""}`.trim()}>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <p>{detail}</p> : null}
    </article>
  );
}

type ChoiceProps = {
  label: string;
  selected?: boolean;
  accent?: string;
  onClick?: () => void;
};

export function ChoiceChip({ label, selected, accent, onClick }: ChoiceProps) {
  return (
    <button
      className={`choice-chip ${selected ? "is-selected" : ""}`}
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      style={accent ? { borderColor: accent } : undefined}
    >
      <span className="chip-dot" style={accent ? { background: accent } : undefined} />
      {label}
    </button>
  );
}

type FieldProps = {
  label: string;
  name?: string;
  placeholder?: string;
  helper?: string;
  type?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  autoComplete?: string;
  maxLength?: number;
  disabled?: boolean;
};

export function FieldBlock({
  label,
  name,
  placeholder,
  helper,
  type = "text",
  value,
  onChange,
  autoComplete,
  maxLength,
  disabled,
}: FieldProps) {
  return (
    <label className="field-block">
      <span>{label}</span>
      <input
        autoComplete={autoComplete}
        disabled={disabled}
        maxLength={maxLength}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      {helper ? <small>{helper}</small> : null}
    </label>
  );
}
