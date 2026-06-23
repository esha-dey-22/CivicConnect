import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminSidebar from "../../components/AdminSidebar";
import AdminPreferencesSync from "../../components/AdminPreferencesSync";
import { ADMIN_EMAILS } from "./constants";

export default async function AdminLayout({ children }) {
  const user = await currentUser();

  if (!user) {
    redirect("/admin-login");
  }

  const primaryEmail =
    user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || "";
  const email = primaryEmail.toLowerCase();

  const isAllowedAdmin = ADMIN_EMAILS.includes(email);
  const isDevelopment = process.env.NODE_ENV !== "production";

  if (!isAllowedAdmin && !isDevelopment) {
    redirect("/");
  }

  const adminName = user.fullName || `${user.firstName || "Admin"} ${user.lastName || ""}`.trim() || "Administrator";

  return (
    <div className="admin-shell min-h-screen bg-(--admin-bg) text-(--admin-text)">
      <AdminPreferencesSync />
      <AdminSidebar adminName={adminName} adminEmail={email} />

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-(--admin-border) bg-(--admin-panel)/95 pl-18 pr-4 py-4 backdrop-blur-xl sm:pl-22 sm:pr-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-(--admin-muted)">Government operations</p>
              <h1 className="mt-1 text-xl font-semibold text-(--admin-text)">CivicConnect Admin Portal</h1>
            </div>

            <div className="flex items-center gap-4 self-start rounded-2xl border border-(--admin-border) bg-(--admin-panel-soft) px-4 py-2 md:self-auto">
              <div className="text-right">
                <p className="text-sm font-medium text-(--admin-text)">{adminName}</p>
                <p className="text-xs text-(--admin-muted)">{email}</p>
              </div>
              <img
                src={user.imageUrl}
                alt={adminName}
                className="h-11 w-11 rounded-full border border-white/10 object-cover"
              />
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}