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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { 
  MapPin, 
  Radar, 
  RotateCw, 
  Waves, 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Tag,
  Bell
} from "lucide-react";
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
  const { reports, refetchReports, reportsLoading, notifications } = useReport();

  const [activeToast, setActiveToast] = useState(null);
  const [initialChecked, setInitialChecked] = useState(false);

  // Auto-toast pop-up logic for new notifications
  useEffect(() => {
    const userEmail = user?.primaryEmailAddress?.emailAddress;
    if (!userEmail || !notifications || !notifications.length) return;

    const userNotifications = notifications.filter(
      (n) =>
        !n.recipientEmail ||
        n.recipientEmail.trim().toLowerCase() === userEmail.trim().toLowerCase()
    );

    const seenRaw = localStorage.getItem("civicconnect_seen_notifications");
    const seenIds = seenRaw ? JSON.parse(seenRaw) : [];

    if (!initialChecked) {
      // Mark all existing notifications as seen on first load
      const allExistingIds = userNotifications.map((n) => n._id || n.id).filter(Boolean);
      const updatedSeenIds = [...new Set([...seenIds, ...allExistingIds])];
      localStorage.setItem("civicconnect_seen_notifications", JSON.stringify(updatedSeenIds));
      setInitialChecked(true);
      return;
    }

    const unseen = userNotifications.find((n) => !seenIds.includes(n._id || n.id));

    if (unseen) {
      setActiveToast(unseen);
      seenIds.push(unseen._id || unseen.id);
      localStorage.setItem("civicconnect_seen_notifications", JSON.stringify(seenIds));
    }
  }, [notifications, user, initialChecked]);

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
        <div className="space-y-8 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
          
          {/* Header row */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-400/90 font-medium">Platform Analytics</p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Live Dashboard Performance</h2>
              <p className="mt-2 text-sm text-slate-300">
                Track resolution rates, priorities, and category distribution for community issues.
              </p>
            </div>
            <button
              onClick={refetchReports}
              disabled={reportsLoading}
              className="flex items-center justify-center gap-2 self-start rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-5 py-3 font-semibold text-white shadow-lg transition duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 sm:self-center"
            >
              <RotateCw className={`h-4 w-4 ${reportsLoading ? "animate-spin" : ""}`} />
              {reportsLoading ? "Refreshing..." : "Refresh Stats"}
            </button>
          </div>

          {/* Metric Cards Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/2 p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-slate-400">Total Registered</p>
                <div className="rounded-lg bg-cyan-50/5 p-2 text-cyan-400">
                  <BarChart3 size={18} />
                </div>
              </div>
              <p className="mt-4 text-3xl font-extrabold text-white">{reports.length}</p>
              <p className="mt-1 text-xs text-slate-400">All filed citizen reports</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/2 p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-slate-400">Resolution Rate</p>
                <div className="rounded-lg bg-emerald-50/5 p-2 text-emerald-400">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <p className="mt-4 text-3xl font-extrabold text-white">
                {reports.length > 0 ? Math.round((resolved / reports.length) * 100) : 0}%
              </p>
              <p className="mt-1 text-xs text-slate-400">{resolved} of {reports.length} issues resolved</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/2 p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-slate-400">Active Operations</p>
                <div className="rounded-lg bg-amber-50/5 p-2 text-amber-400">
                  <Activity size={18} />
                </div>
              </div>
              <p className="mt-4 text-3xl font-extrabold text-white">
                {reports.filter(r => r.status === "Pending" || r.status === "Under Process" || r.status === "Filed").length}
              </p>
              <p className="mt-1 text-xs text-slate-400">In process or pending backlog</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/2 p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-slate-400">High Severity</p>
                <div className="rounded-lg bg-red-55/5 p-2 text-red-400">
                  <AlertTriangle size={18} />
                </div>
              </div>
              <p className="mt-4 text-3xl font-extrabold text-white">
                {reports.filter(r => r.priority === "High" && r.status !== "Resolved").length}
              </p>
              <p className="mt-1 text-xs text-slate-400">Unresolved high priority issues</p>
            </div>
          </div>

          {/* Interactive Chart Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            
            {/* Status Distribution Funnel */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">Resolution Status Funnel</h3>
              <div className="h-[280px]">
                <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                    <XAxis dataKey="status" stroke="#94a3b8" fontSize={11} />
                    <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: "#0f172a",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "#f8fafc",
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => {
                        let color = "#38bdf8"; // default sky-400 for pending/other
                        if (entry.status === "Resolved") color = "#34d399"; // emerald-400
                        if (entry.status === "Under Process") color = "#fbbf24"; // amber-400
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Priority Doughnut Chart */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">Severity Breakdown</h3>
              <div className="h-[280px] flex flex-col justify-between">
                <div className="h-[220px] w-full">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "High Priority", value: reports.filter(r => r.priority === "High").length, color: "#ef4444" },
                          { name: "Medium Priority", value: reports.filter(r => r.priority === "Medium").length, color: "#facc15" },
                          { name: "Low Priority", value: reports.filter(r => r.priority === "Low").length, color: "#3b82f6" }
                        ].filter(p => p.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { name: "High Priority", value: reports.filter(r => r.priority === "High").length, color: "#ef4444" },
                          { name: "Medium Priority", value: reports.filter(r => r.priority === "Medium").length, color: "#facc15" },
                          { name: "Low Priority", value: reports.filter(r => r.priority === "Low").length, color: "#3b82f6" }
                        ].filter(p => p.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#0f172a",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                          color: "#f8fafc",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />High ({reports.filter(r => r.priority === "High").length})</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-yellow-400" />Medium ({reports.filter(r => r.priority === "Medium").length})</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" />Low ({reports.filter(r => r.priority === "Low").length})</span>
                </div>
              </div>
            </div>

          </div>

          {/* Top Categories Horizontal Chart */}
          {reports.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">Top 5 Issue Categories</h3>
              <div className="h-[200px]">
                <ResponsiveContainer>
                  <BarChart
                    layout="vertical"
                    data={Object.entries(
                      reports.reduce((acc, r) => {
                        const cat = r.category || "General";
                        acc[cat] = (acc[cat] || 0) + 1;
                        return acc;
                      }, {})
                    )
                      .map(([name, value]) => ({ name, value }))
                      .sort((a, b) => b.value - a.value)
                      .slice(0, 5)}
                    margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                    <XAxis type="number" allowDecimals={false} stroke="#94a3b8" fontSize={11} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: "#0f172a",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "#f8fafc",
                      }}
                    />
                    <Bar dataKey="value" fill="#818cf8" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {reports.length === 0 ? (
            <p className="text-sm text-slate-500 text-center">No complaints filed yet. Populate the system to see full insights.</p>
          ) : null}
        </div>
      )}

      {/* Dynamic Notification Toast Pop-Up */}
      {activeToast && (
        <div className="fixed top-28 sm:top-24 right-6 z-[999] max-w-sm rounded-2xl border border-cyan-400/30 bg-slate-900/90 p-4 shadow-2xl backdrop-blur-md transition-all duration-500 animate-slide-in">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-cyan-500/20 p-2 text-cyan-400">
              <Bell className="h-5 w-5 animate-bounce" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  New Update
                </span>
                <button
                  type="button"
                  onClick={() => setActiveToast(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  &times;
                </button>
              </div>
              <p className="mt-1 text-sm font-medium text-white leading-relaxed">
                {activeToast.message}
              </p>
              <p className="mt-2 text-[10px] text-slate-400">
                {new Date(activeToast.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
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