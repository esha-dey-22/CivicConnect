"use client";

import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useReport } from "../../context/ReportContext";
import { 
  RotateCw, 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle, 
  Activity 
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const { reports, refetchReports, reportsLoading } = useReport();

  const total = reports.length;
  const filed = reports.filter((report) => report.status === "Filed").length;
  const pending = reports.filter((report) => report.status === "Pending").length;
  const processing = reports.filter((report) => report.status === "Under Process").length;
  const resolved = reports.filter((report) => report.status === "Resolved").length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const activeBacklog = filed + pending + processing;
  const highSeverityUnresolved = reports.filter((r) => r.priority === "High" && r.status !== "Resolved").length;

  const statusChartData = [
    { name: "Filed", count: filed },
    { name: "Pending", count: pending },
    { name: "Under Process", count: processing },
    { name: "Resolved", count: resolved },
  ];

  const priorityData = [
    { name: "High", value: reports.filter((r) => r.priority === "High").length, color: "#ef4444" },
    { name: "Medium", value: reports.filter((r) => r.priority === "Medium").length, color: "#facc15" },
    { name: "Low", value: reports.filter((r) => r.priority === "Low").length, color: "#3b82f6" },
  ].filter((p) => p.value > 0);

  const categoryData = Object.entries(
    reports.reduce((acc, r) => {
      const cat = r.category || "General";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <div className="space-y-6 text-[var(--admin-text)]">
      
      {/* Header Panel */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-xl shadow-black/10 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--admin-muted)]">Operations & Stats</p>
          <h2 className="mt-2 text-2xl font-bold">Administrative Analytics Console</h2>
          <p className="mt-2 text-sm text-[var(--admin-muted)]">
            Analyze platform-wide complaints, categories, and resolution metrics dynamically.
          </p>
        </div>
        <button
          onClick={refetchReports}
          disabled={reportsLoading}
          className="flex items-center justify-center gap-2 self-start rounded-2xl border border-white/10 bg-slate-950/50 px-5 py-3 text-base text-white outline-none transition hover:bg-slate-900 active:scale-95 disabled:opacity-50 sm:self-center"
        >
          <RotateCw className={`h-4 w-4 ${reportsLoading ? "animate-spin" : ""}`} />
          {reportsLoading ? "Refreshing..." : "Refresh Insights"}
        </button>
      </div>

      {/* Operations Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Complaints", value: total, desc: "All incoming citizen reports", icon: <BarChart3 size={18} />, colorBg: "bg-sky-500/10 text-sky-400" },
          { label: "Resolution Rate", value: `${resolutionRate}%`, desc: `${resolved} total solved tickets`, icon: <CheckCircle2 size={18} />, colorBg: "bg-emerald-500/10 text-emerald-400" },
          { label: "Active Operations", value: activeBacklog, desc: "Pending queue + under process", icon: <Activity size={18} />, colorBg: "bg-amber-500/10 text-amber-400" },
          { label: "High Severity", value: highSeverityUnresolved, desc: "Unresolved critical backlog", icon: <AlertTriangle size={18} />, colorBg: "bg-red-500/10 text-red-400" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-panel-soft)] p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-[var(--admin-muted)]">{card.label}</p>
              <div className={`rounded-xl p-2.5 ${card.colorBg}`}>
                {card.icon}
              </div>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-[var(--admin-text)]">{card.value}</p>
            <p className="mt-1 text-xs text-[var(--admin-muted)]">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Status bar chart */}
        <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-xl shadow-black/10">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-text)] mb-4">Operations Pipeline</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer>
              <BarChart data={statusChartData} margin={{ top: 20, right: 10, bottom: 10, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                <XAxis dataKey="name" stroke="rgba(148, 163, 184, 0.8)" fontSize={11} />
                <YAxis stroke="rgba(148, 163, 184, 0.8)" allowDecimals={false} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "#0b1729",
                    border: "1px solid rgba(148,163,184,0.2)",
                    borderRadius: "16px",
                    color: "#e5eef7",
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {statusChartData.map((entry, index) => {
                    let color = "#38bdf8"; // Filed/Pending (Sky)
                    if (entry.name === "Resolved") color = "#10b981"; // Emerald
                    if (entry.name === "Under Process") color = "#f59e0b"; // Amber
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority breakdown doughnut */}
        <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-xl shadow-black/10">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-text)] mb-4">Severity Breakdown</h3>
          <div className="h-[300px] flex flex-col justify-between">
            <div className="h-[240px] w-full">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#0b1729",
                      border: "1px solid rgba(148,163,184,0.2)",
                      borderRadius: "16px",
                      color: "#e5eef7",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 text-xs text-[var(--admin-muted)]">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />High ({reports.filter(r => r.priority === "High").length})</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />Medium ({reports.filter(r => r.priority === "Medium").length})</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" />Low ({reports.filter(r => r.priority === "Low").length})</span>
            </div>
          </div>
        </div>

      </div>

      {/* Top Categories list bar chart */}
      {reports.length > 0 && (
        <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-xl shadow-black/10">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-text)] mb-4">Top 5 Issue Categories by Frequency</h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer>
              <BarChart
                layout="vertical"
                data={categoryData}
                margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                <XAxis type="number" stroke="rgba(148, 163, 184, 0.8)" allowDecimals={false} fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="rgba(148, 163, 184, 0.8)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "#0b1729",
                    border: "1px solid rgba(148,163,184,0.2)",
                    borderRadius: "16px",
                    color: "#e5eef7",
                  }}
                />
                <Bar dataKey="value" fill="#818cf8" radius={[0, 5, 5, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="rounded-3xl border border-dashed border-[var(--admin-border)] py-12 text-center text-sm text-[var(--admin-muted)]">
          No complaints registered in the database yet.
        </div>
      )}

    </div>
  );
}