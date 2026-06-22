"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Shield } from "lucide-react";
import { ADMIN_MENU } from "../app/admin/constants";

export default function AdminSidebar({ adminName, adminEmail }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-(--admin-border) bg-(--admin-panel) px-5 py-6 text-(--admin-text) backdrop-blur-xl lg:flex">
      <div className="mb-8 rounded-2xl border border-white/5 bg-white/5 px-4 py-4 shadow-lg shadow-black/10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
            <Shield size={20} />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">CivicConnect</p>
            <p className="text-sm text-(--admin-muted)">Admin Control Panel</p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-white/5 bg-black/15 px-4 py-3">
          <p className="text-sm font-medium">{adminName}</p>
          <p className="mt-1 text-xs text-(--admin-muted)">{adminEmail}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {ADMIN_MENU.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`);

          return (
            <Link
              key={item.name}
              href={item.path}
              className={`group flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${
                isActive
                  ? "border-sky-400/30 bg-sky-500/10 text-white shadow-lg shadow-sky-500/5"
                  : "border-transparent text-(--admin-muted) hover:border-white/5 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon size={17} />
                {item.name}
              </span>
              <ChevronRight size={14} className={`transition ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-70"}`} />
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded-2xl border border-white/5 bg-sky-500/5 px-4 py-4 text-sm text-(--admin-muted)">
        Access is restricted to government operators and verified administrators.
      </div>
    </aside>
  );
}