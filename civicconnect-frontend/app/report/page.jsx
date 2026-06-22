"use client";

import ReportForm from "../../components/ReportForm";

export default function ReportPage() {

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 text-white">
      <ReportForm redirectOnSubmit />
    </div>
  );
}