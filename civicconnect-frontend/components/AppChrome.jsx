"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function AppChrome({ children }) {
  const pathname = usePathname();
  const isAdminArea = pathname?.startsWith("/admin") || pathname === "/admin-login";

  if (isAdminArea) {
    return <main className="min-h-screen bg-[var(--background)]">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 sm:pt-24">{children}</main>
      <Footer />
    </>
  );
}