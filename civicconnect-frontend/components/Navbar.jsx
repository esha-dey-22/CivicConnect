"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  const clerkReady = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 text-white sm:px-6 sm:py-4 md:flex-row md:items-center md:justify-between">

        <Link href="/" className="text-xl font-bold tracking-tight text-sky-300 sm:text-2xl">
          CivicConnect
        </Link>

        <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-slate-200 md:justify-end">

          <Link href="/">Home</Link>
          <Link href="/about">About</Link>

          <SignedIn>
            <>
              <Link href="/dashboard">Dashboard</Link>
            </>
          </SignedIn>

          {clerkReady ? (
            <>
              <SignedOut>
                <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
                  <Link href="/sign-in" className="rounded-full border border-white/10 px-3 py-1 hover:border-white/30">
                    User Login
                  </Link>
                  <Link href="/admin-login" className="rounded-full border border-sky-400/30 px-3 py-1 text-sky-200 hover:border-sky-300 hover:text-white">
                    Admin Login
                  </Link>
                </div>
              </SignedOut>

              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </>
          ) : (
            <Link href="/sign-in" className="rounded-full border border-white/10 px-3 py-1 hover:border-white/30">
              User Sign In
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
}