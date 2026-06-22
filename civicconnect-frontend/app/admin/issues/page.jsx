"use client";

import { useMemo, useState } from "react";
import { useReport } from "../../context/ReportContext";
import ComplaintTable from "../../../components/ComplaintTable";

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

export default function AdminIssuesPage() {
  const { reports, updateReportStatus } = useReport();
  const [selectedCategory, setSelectedCategory] = useState("All");

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

  const filteredReports = useMemo(
    () =>
      reports.filter((report) => {
        if (selectedCategory === "All") {
          return true;
        }

        return (report?.category || "General") === selectedCategory;
      }),
    [reports, selectedCategory]
  );

  const handleStatusChange = async (id, nextStatus) => {
    const result = await updateReportStatus(id, nextStatus);

    if (!result?.success) {
      alert(result?.error || "Unable to update complaint status.");
    }
  };

  return (
    <div className="space-y-6 text-[var(--admin-text)]">
      <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-xl shadow-black/10">
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--admin-muted)]">Complaint management</p>
        <h2 className="mt-2 text-2xl font-semibold">Manage all complaints</h2>
        <p className="mt-3 max-w-3xl text-sm text-[var(--admin-muted)]">
          Update complaint progress through the allowed workflow. The table remains synchronized with the public registry and dashboard.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-[var(--admin-muted)]">Filter by category</label>
        <select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          className="min-w-60 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-base text-white outline-none transition focus:border-sky-400/50"
        >
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <ComplaintTable
        complaints={filteredReports}
        editable
        onStatusChange={handleStatusChange}
        emptyMessage="No complaints are available for review."
      />
    </div>
  );
}