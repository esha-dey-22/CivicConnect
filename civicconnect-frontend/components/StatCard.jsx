export default function StatCard({ title, value, subtitle, accent = "text-white" }) {
  return (
    <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-panel-soft)] p-5 shadow-lg shadow-black/10">
      <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--admin-muted)]">
        {title}
      </h3>
      <p className={`mt-3 text-3xl font-semibold tracking-tight ${accent}`}>
        {value}
      </p>
      {subtitle ? <p className="mt-2 text-sm text-[var(--admin-muted)]">{subtitle}</p> : null}
    </div>
  );
}