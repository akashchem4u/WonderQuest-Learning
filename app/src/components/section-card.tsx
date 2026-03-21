type SectionCardProps = {
  title: string;
  subtitle?: string;
  items: string[];
  className?: string;
};

export function SectionCard({
  title,
  subtitle,
  items,
  className,
}: SectionCardProps) {
  return (
    <section className={`card ${className ?? ""}`.trim()}>
      <div className="card-header">
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
