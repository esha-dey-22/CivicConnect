"use client";

import dynamic from "next/dynamic";
import { useReport } from "../../context/ReportContext";

const AdminMapView = dynamic(() => import("../../../components/AdminMapView"), {
  ssr: false,
});

export default function AdminMapPage() {
  const { reports } = useReport();

  return (
    <div className="space-y-6 text-[var(--admin-text)]">
      <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-xl shadow-black/10">
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--admin-muted)]">Map monitoring</p>
        <h2 className="mt-2 text-2xl font-semibold">Complaint location overview</h2>
        <p className="mt-3 max-w-3xl text-sm text-[var(--admin-muted)]">
          Search any area to view complaint density markers. Red indicates high concentration, yellow medium, and blue low (&lt; 8) complaints. Use priority dropdown to focus action queues.
        </p>
      </div>

      <AdminMapView reports={reports} />
    </div>
  );
}