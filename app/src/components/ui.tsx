type CardProps = {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
};

export function ShellCard({ title, eyebrow, children }: CardProps) {
  return (
    <section className="shell-card">
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
};

export function StatTile({ label, value, detail }: StatProps) {
  return (
    <article className="stat-tile">
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
  placeholder?: string;
  helper?: string;
  type?: string;
};

export function FieldBlock({ label, placeholder, helper, type = "text" }: FieldProps) {
  return (
    <label className="field-block">
      <span>{label}</span>
      <input type={type} placeholder={placeholder} />
      {helper ? <small>{helper}</small> : null}
    </label>
  );
}
