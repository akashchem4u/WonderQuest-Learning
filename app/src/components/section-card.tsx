type SectionCardProps = {
  title: string;
  subtitle?: string;
  items: string[];
};

export function SectionCard({ title, subtitle, items }: SectionCardProps) {
  return (
    <section className="card">
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
