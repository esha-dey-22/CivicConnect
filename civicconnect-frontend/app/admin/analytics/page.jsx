"use client";

import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useReport } from "../../context/ReportContext";

export default function AdminAnalyticsPage() {
  const { reports } = useReport();

  const pending = reports.filter((report) => report.status === "Pending").length;
  const processing = reports.filter((report) => report.status === "Under Process").length;
  const resolved = reports.filter((report) => report.status === "Resolved").length;

  const chartData = [
    { name: "Pending", value: pending },
    { name: "Under Process", value: processing },
    { name: "Resolved", value: resolved },
  ];

  return (
    <div className="space-y-6 text-[var(--admin-text)]">
      <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-xl shadow-black/10">
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--admin-muted)]">Analytics</p>
        <h2 className="mt-2 text-2xl font-semibold">Complaint resolution bar graph</h2>
        <p className="mt-3 max-w-3xl text-sm text-[var(--admin-muted)]">
          This chart shows the live distribution of complaint statuses from the shared report context.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Pending", value: pending, accent: "text-sky-300" },
          { label: "Under Process", value: processing, accent: "text-amber-300" },
          { label: "Resolved", value: resolved, accent: "text-emerald-300" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-panel-soft)] p-5">
            <p className="text-sm text-[var(--admin-muted)]">{item.label}</p>
            <p className={`mt-2 text-3xl font-semibold ${item.accent}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-xl shadow-black/10">
        <div className="h-[420px] w-full">
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.18)" />
              <XAxis dataKey="name" stroke="rgba(148, 163, 184, 0.9)" />
              <YAxis stroke="rgba(148, 163, 184, 0.9)" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "#0b1729",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  borderRadius: "16px",
                  color: "#e5eef7",
                }}
              />
              <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#7dd3fc" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}