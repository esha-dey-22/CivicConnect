"use client";

import { useState } from "react";
import { useReport } from "../../context/ReportContext";

export default function AdminNotificationsPage() {
  const { notifications, sendNotification } = useReport();
  const [message, setMessage] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    sendNotification(message, recipientEmail);
    setMessage("");
    setRecipientEmail("");
  };

  return (
    <div className="space-y-6 text-[var(--admin-text)]">
      <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-xl shadow-black/10">
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--admin-muted)]">Notifications</p>
        <h2 className="mt-2 text-2xl font-semibold">Send public updates</h2>
        <p className="mt-3 max-w-3xl text-sm text-[var(--admin-muted)]">
          Messages are simulated on the frontend and stored in shared context so the citizen complaints page can display them.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-panel-soft)] p-6 shadow-xl shadow-black/10">
        <label className="mb-2 block text-sm font-medium text-[var(--admin-muted)]">User email (optional)</label>
        <input
          type="email"
          value={recipientEmail}
          onChange={(event) => setRecipientEmail(event.target.value)}
          className="mb-4 w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3 text-[var(--admin-text)] outline-none transition placeholder:text-[var(--admin-muted)] focus:border-sky-400/50"
          placeholder="user@example.com (leave empty to notify all users)"
        />

        <label className="mb-2 block text-sm font-medium text-[var(--admin-muted)]">Notification message</label>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3 text-[var(--admin-text)] outline-none transition placeholder:text-[var(--admin-muted)] focus:border-sky-400/50"
          placeholder="Write a public update for residents..."
        />

        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-sm text-[var(--admin-muted)]">The latest notifications are shown on the user complaints page.</p>
          <button
            type="submit"
            className="rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            Send update
          </button>
        </div>
      </form>

      <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 shadow-xl shadow-black/10">
        <h3 className="text-lg font-semibold">Recent notifications</h3>
        <div className="mt-4 space-y-3">
          {notifications.length === 0 ? (
            <p className="text-sm text-[var(--admin-muted)]">No notifications have been sent yet.</p>
          ) : (
            notifications.map((notification, index) => (
              <div key={notification._id || notification.id || index} className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-panel-soft)] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--admin-muted)]">
                  {notification.recipientEmail ? `To: ${notification.recipientEmail}` : "To: All users"}
                </p>
                <p className="text-sm text-[var(--admin-text)]">{notification.message}</p>
                <p className="mt-1 text-xs text-[var(--admin-muted)]" suppressHydrationWarning>
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}