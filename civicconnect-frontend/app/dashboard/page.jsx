"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MapPin, Radar, RotateCw, Waves } from "lucide-react";
import ReportForm from "../../components/ReportForm";
import ComplaintsRegistry from "../../components/ComplaintsRegistry";
import { useReport } from "../context/ReportContext";

const MapView = dynamic(() => import("../../components/MapView"), {
  ssr: false,
});

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("report");
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const { reports, refetchReports, reportsLoading } = useReport();

  const pending = reports.filter((report) => report.status === "Pending").length;
  const processing = reports.filter((report) => report.status === "Under Process").length;
  const resolved = reports.filter((report) => report.status === "Resolved").length;

  const chartData = [
    { status: "Pending", count: pending },
    { status: "Under Process", count: processing },
    { status: "Resolved", count: resolved },
  ];

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return <div className="px-4 py-6 text-white sm:px-6 lg:p-10">Loading dashboard...</div>;
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="mx-auto min-h-screen max-w-7xl bg-linear-to-br from-[#0f172a] to-[#111827] px-4 py-6 text-white sm:px-6 lg:px-10 lg:py-10">

      <h1 className="mb-6 text-3xl font-bold sm:mb-8 sm:text-4xl">Welcome {user?.firstName ? `${user.firstName} ` : ""}👋</h1>

      {/* Tabs */}

      <div className="mb-8 grid grid-cols-2 gap-3 sm:mb-10 sm:flex sm:flex-wrap">
        <Tab label="Report" tab="report" activeTab={activeTab} setActiveTab={setActiveTab}/>
        <Tab label="Registry" tab="registry" activeTab={activeTab} setActiveTab={setActiveTab}/>
        <Tab label="Map" tab="map" activeTab={activeTab} setActiveTab={setActiveTab}/>
        <Tab label="Stats" tab="stats" activeTab={activeTab} setActiveTab={setActiveTab}/>
      </div>

      {/* REPORT */}

      {activeTab === "report" && (
        <div className="rounded-2xl border border-white/10 bg-white/2 p-4 sm:p-6">
          <ReportForm redirectOnSubmit={false} />
        </div>
      )}

      {/* REGISTRY */}

      {activeTab === "registry" && (
        <div className="rounded-2xl border border-white/10 bg-white/2 p-4 sm:p-6">
          <ComplaintsRegistry />
        </div>
      )}

      {/* MAP */}

      {activeTab === "map" && (
        <div className="space-y-6 rounded-2xl border border-cyan-300/15 bg-[radial-gradient(circle_at_20%_15%,rgba(34,211,238,0.16),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.16),transparent_45%),linear-gradient(160deg,rgba(15,23,42,0.96),rgba(2,6,23,0.96))] p-4 shadow-2xl shadow-cyan-900/20 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">Geo monitor</p>
              <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Live Civic Map Console</h2>
              <p className="mt-2 max-w-3xl text-sm text-slate-300">
                Scan city coordinates, verify clusters, and inspect locations reported by citizens in real time.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 sm:gap-2 lg:min-w-[20rem]">
              <div className="rounded-xl border border-cyan-300/20 bg-cyan-500/10 px-3 py-3 text-center">
                <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-200/80">Pins</p>
                <p className="mt-1 text-2xl font-semibold text-white">{reports.length}</p>
              </div>
              <div className="rounded-xl border border-amber-300/20 bg-amber-500/10 px-3 py-3 text-center">
                <p className="text-[11px] uppercase tracking-[0.2em] text-amber-200/80">Active</p>
                <p className="mt-1 text-2xl font-semibold text-white">{pending + processing}</p>
              </div>
              <div className="rounded-xl border border-emerald-300/20 bg-emerald-500/10 px-3 py-3 text-center">
                <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-200/80">Resolved</p>
                <p className="mt-1 text-2xl font-semibold text-white">{resolved}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
              <div className="flex items-center gap-2 text-cyan-300"><Radar size={16} /><span className="text-sm font-medium">Monitoring mode</span></div>
              <p className="mt-2 text-xs text-slate-300">Satellite dark grid with city search and live-location trace.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
              <div className="flex items-center gap-2 text-cyan-300"><MapPin size={16} /><span className="text-sm font-medium">Marker intelligence</span></div>
              <p className="mt-2 text-xs text-slate-300">Markers indicate user-reported points and help prioritize actions.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
              <div className="flex items-center gap-2 text-cyan-300"><Waves size={16} /><span className="text-sm font-medium">Response flow</span></div>
              <p className="mt-2 text-xs text-slate-300">Combine map monitoring with status updates from the Registry tab.</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-cyan-300/20 bg-slate-950/50 p-2 sm:p-3">
            <MapView reports={reports} />
          </div>
        </div>
      )}

      {/* STATS */}

      {activeTab === "stats" && (
        <div className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-sky-300/80">Status analytics</p>
              <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">Complaint progress bar graph</h2>
              <p className="mt-2 text-sm text-slate-300">The chart updates automatically as you add complaints and status values change.</p>
            </div>
            <button
              onClick={refetchReports}
              disabled={reportsLoading}
              className="flex items-center justify-center gap-2 self-start rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white shadow-lg transition duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <RotateCw className={`h-4 w-4 ${reportsLoading ? "animate-spin" : ""}`} />
              {reportsLoading ? "Reloading..." : "Reload"}
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-sky-300/20 bg-sky-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-sky-200/80">Pending</p>
              <p className="mt-2 text-3xl font-semibold text-white">{pending}</p>
            </div>
            <div className="rounded-xl border border-amber-300/20 bg-amber-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-amber-200/80">Under Process</p>
              <p className="mt-2 text-3xl font-semibold text-white">{processing}</p>
            </div>
            <div className="rounded-xl border border-emerald-300/20 bg-emerald-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">Resolved</p>
              <p className="mt-2 text-3xl font-semibold text-white">{resolved}</p>
            </div>
          </div>

          <div className="h-[320px] rounded-2xl border border-white/10 bg-slate-950/40 p-3 sm:h-[360px] sm:p-4">
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="status" stroke="rgba(203,213,225,0.9)" />
                <YAxis allowDecimals={false} stroke="rgba(203,213,225,0.9)" />
                <Tooltip
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid rgba(148,163,184,0.2)",
                    borderRadius: "12px",
                    color: "#e2e8f0",
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#38bdf8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {reports.length === 0 ? (
            <p className="text-sm text-slate-400">No complaints yet. Add one in Report tab to populate the chart.</p>
          ) : null}
        </div>
      )}

    </div>
  );
}

function Tab({ label, tab, activeTab, setActiveTab }) {

  const isActive = activeTab === tab;

  return (
    <button
      onClick={() => setActiveTab(tab)}
      className={`rounded-xl px-4 py-2 text-sm sm:px-6 ${
        isActive
          ? "bg-linear-to-r from-indigo-600 to-purple-600 shadow-lg"
          : "bg-white/10 hover:bg-white/20"
      }`}
    >
      {label}
    </button>
  );
}