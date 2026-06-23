"use client";

import { useMemo, useState } from "react";
import { RotateCw } from "lucide-react";
import { useReport } from "../app/context/ReportContext";
import ComplaintTable from "./ComplaintTable";

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

export default function ComplaintsRegistry() {
  const { reports, notifications, reportsLoading, reportsError, refetchReports } = useReport();
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

  return (
    <>
      <div className="mb-8 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.28em] text-sky-300/80">Public registry</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Submitted complaints</h1>
        <p className="mt-3 text-slate-300">
          Every report submitted through the civic portal appears here in read-only form.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Total complaints</p>
          <p className="mt-2 text-2xl font-semibold sm:text-3xl">{reports.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Latest status</p>
          <p className="mt-2 text-2xl font-semibold sm:text-3xl">{reports[0]?.status || "None"}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Notifications</p>
          <p className="mt-2 text-2xl font-semibold sm:text-3xl">{notifications.length}</p>
        </div>
      </div>

      {reportsLoading ? <p className="mb-4 text-sm text-slate-300">Loading complaints...</p> : null}
      {reportsError ? <p className="mb-4 text-sm text-red-300">{reportsError}</p> : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-slate-300">Filter by category</label>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="min-w-60 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-base text-white outline-none transition focus:border-sky-400/50"
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category} className="text-slate-900">
                {category}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={refetchReports}
          disabled={reportsLoading}
          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-base text-white outline-none transition hover:bg-white/10 active:scale-95 disabled:opacity-50"
        >
          <RotateCw className={`h-4 w-4 ${reportsLoading ? "animate-spin" : ""}`} />
          {reportsLoading ? "Reloading..." : "Reload"}
        </button>
      </div>

      <ComplaintTable
        complaints={filteredReports}
        emptyMessage="No complaints submitted yet. Use the report form to add the first record."
      />

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">Notifications</h2>
        <div className="mt-4 space-y-3">
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-400">No updates have been sent yet.</p>
          ) : (
            notifications.map((notification, index) => (
              <div key={notification._id || notification.id || index} className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  {notification.recipientEmail ? `To: ${notification.recipientEmail}` : "To: All users"}
                </p>
                <p className="text-sm text-slate-200">{notification.message}</p>
                <p className="mt-1 text-xs text-slate-500">{new Date(notification.createdAt).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}