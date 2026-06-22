"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";
import { useReport } from "../context/ReportContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function StatsPage() {

  const { reports } = useReport();

  const pending = reports.filter(r => r.status === "Pending").length;
  const resolved = reports.filter(r => r.status === "Resolved").length;
  const process = reports.filter(r => r.status === "Under Process").length;

  const data = {
    labels: ["Pending", "Under Process", "Resolved"],
    datasets: [
      {
        label: "Your Complaints",
        data: [pending, process, resolved],
        backgroundColor: [
          "#6366f1",
          "#f59e0b",
          "#10b981"
        ],
        borderRadius: 8
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return (

    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">

      <h1 className="mb-6 text-2xl font-bold text-white sm:text-3xl">
        Issue Statistics
      </h1>

      {/* Summary Cards */}

      <div className="mb-8 grid gap-4 md:grid-cols-3">

        <div className="rounded-lg bg-indigo-600 p-5 text-center sm:p-6">
          <h2 className="text-lg">Pending</h2>
          <p className="text-2xl font-bold">{pending}</p>
        </div>

        <div className="rounded-lg bg-yellow-500 p-5 text-center sm:p-6">
          <h2 className="text-lg">Under Process</h2>
          <p className="text-2xl font-bold">{process}</p>
        </div>

        <div className="rounded-lg bg-green-600 p-5 text-center sm:p-6">
          <h2 className="text-lg">Resolved</h2>
          <p className="text-2xl font-bold">{resolved}</p>
        </div>

      </div>

      {/* Bar Graph */}

      <div className="rounded-xl bg-white/5 p-4 sm:p-6">

        <Bar data={data} options={options} />

      </div>

    </div>
  );
}