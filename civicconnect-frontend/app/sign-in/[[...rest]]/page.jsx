"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  const clerkReady = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!clerkReady) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-white">
        <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-black/20">
          <h1 className="text-3xl font-semibold">Authentication is not configured</h1>
          <p className="mt-4 text-sm text-slate-300">Set the Clerk publishable key to enable user sign-in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <SignIn afterSignInUrl="/redirect" />
    </div>
  );
}