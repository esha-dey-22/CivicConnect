"use client";

import { SignUp } from "@clerk/nextjs";

export default function Page() {
  const clerkReady = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!clerkReady) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-white">
        <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-black/20">
          <h1 className="text-3xl font-semibold">Authentication is not configured</h1>
          <p className="mt-4 text-sm text-slate-300">Set the Clerk publishable key to enable user sign-up.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0f172a] to-[#020617]">

      <div className="p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl">

        <SignUp
          appearance={{
            elements: {
              card: "bg-transparent shadow-none",
              headerTitle: "text-white text-2xl",
              formButtonPrimary:
                "bg-indigo-600 hover:bg-indigo-500",
            },
          }}
        />

      </div>
    </div>
  );
}