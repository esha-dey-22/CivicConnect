"use client";

import { useMemo, useState } from "react";
import { useReport } from "../context/ReportContext";
import StatCard from "../../components/StatCard";
import ComplaintTable from "../../components/ComplaintTable";

const CATEGORY_FILTER_OPTIONS = [
  "All",
  "Garbage",
  "Street Light",
  "Water Leakage",
  "Road Damage",
  "Drainage",
  "Sewage",
  "Traffic Signal",
  "Illegal Parking",
  "Noise Pollution",
  "Air Pollution",
  "Public Toilet",
  "Encroachment",
  "Stray Animals",
  "Other",
  "General",
];

export default function AdminDashboardPage() {
  const { reports, notifications } = useReport();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const counts = reports.reduce(
    (accumulator, report) => {
      accumulator.total += 1;

      if (report.status === "Resolved") {
        accumulator.resolved += 1;
      } else if (report.status === "Under Process") {
        accumulator.processing += 1;
      } else {
        accumulator.pending += 1;
      }

      return accumulator;
    },
    { total: 0, pending: 0, processing: 0, resolved: 0 }
  );

  const categoryOptions = useMemo(() => {
    const categoriesInReports = new Set(
      reports
        .map((report) => (report?.category || "General").trim())
        .filter(Boolean)
    );

    const merged = new Set(CATEGORY_FILTER_OPTIONS);
    categoriesInReports.forEach((category) => merged.add(category));

    return Array.from(merged);
  }, [reports]);

  const recentReports = useMemo(
    () =>
      reports
        .filter((report) => {
          if (selectedCategory === "All") {
            return true;
          }

          return (report?.category || "General") === selectedCategory;
        })
        .slice(-5)
        .reverse(),
    [reports, selectedCategory]
  );

  return (
    <div className="space-y-8 text-[var(--admin-text)]">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total complaints" value={counts.total} subtitle="All reports in shared context" />
        <StatCard title="Pending" value={counts.pending} subtitle="Waiting for review" accent="text-sky-300" />
        <StatCard title="Under process" value={counts.processing} subtitle="Assigned to teams" accent="text-amber-300" />
        <StatCard title="Resolved" value={counts.resolved} subtitle="Closed complaints" accent="text-emerald-300" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
        <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-xl shadow-black/10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Recent complaints</h2>
              <p className="text-sm text-[var(--admin-muted)]">Latest submissions from the citizen registry</p>
            </div>

            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="min-w-56 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/50"
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <ComplaintTable complaints={recentReports} compact emptyMessage="No complaints have been reported yet." />
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-xl shadow-black/10">
            <h2 className="text-lg font-semibold">Operational notes</h2>
            <div className="mt-4 space-y-4 text-sm text-[var(--admin-muted)]">
              <p>• Complaint status changes are restricted to the allowed workflow: Pending, Under Process, Resolved.</p>
              <p>• All activity reads from the shared client context so the user portal and admin portal stay in sync.</p>
              <p>• Notifications published from the admin panel appear immediately on the public complaints registry.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-xl shadow-black/10">
            <h2 className="text-lg font-semibold">Notifications sent</h2>
            <p className="mt-2 text-3xl font-semibold text-[var(--admin-text)]">{notifications.length}</p>
            <p className="mt-2 text-sm text-[var(--admin-muted)]">Messages distributed to the public complaints view.</p>
          </div>
        </div>
      </section>
    </div>
  );
}