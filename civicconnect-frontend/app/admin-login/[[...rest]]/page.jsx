"use client";

import { SignIn } from "@clerk/nextjs";

export default function AdminLoginPage() {
  const clerkReady = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!clerkReady) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-white">
        <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-black/20">
          <p className="text-sm uppercase tracking-[0.25em] text-sky-300/80">Admin access</p>
          <h1 className="mt-3 text-3xl font-semibold">Authentication is not configured</h1>
          <p className="mt-4 text-sm text-slate-300">
            Set the Clerk publishable key to enable the administrator login flow.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{
        backgroundImage:
          "radial-gradient(circle_at_top, rgba(14,165,233,0.22), transparent 35%), linear-gradient(135deg, #020617, #0f172a 45%, #020617)",
      }}
    >
      <div className="border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl" style={{ borderRadius: "2rem" }}>
        <SignIn afterSignInUrl="/admin" routing="path" path="/admin-login" />
      </div>
    </div>
  );
}