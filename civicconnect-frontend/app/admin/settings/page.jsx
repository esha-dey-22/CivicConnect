"use client";

import { useEffect, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { applyPreferences, SCALE_KEY, THEME_KEY } from "../../../components/AdminPreferencesSync";

export default function AdminSettingsPage() {
  const { signOut } = useClerk();
  const [theme, setTheme] = useState("dark");
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_KEY) || "dark";
    const storedScale = Number(window.localStorage.getItem(SCALE_KEY) || "1");

    setTheme(storedTheme);
    setScale(storedScale);
    applyPreferences();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(THEME_KEY, theme);
    document.documentElement.dataset.adminTheme = theme;
  }, [theme]);

  useEffect(() => {
    const normalizedScale = Number(scale.toFixed(2));
    window.localStorage.setItem(SCALE_KEY, String(normalizedScale));
    document.documentElement.style.setProperty("--admin-scale", String(normalizedScale));
  }, [scale]);

  const increaseZoom = () => setScale((current) => Math.min(1.2, Number((current + 0.05).toFixed(2))));
  const decreaseZoom = () => setScale((current) => Math.max(0.85, Number((current - 0.05).toFixed(2))));
  const resetZoom = () => setScale(1);
  const handleSignOut = async () => {
    await signOut();
    window.location.assign("/");
  };

  const pageStyle = { color: "var(--admin-text)" };
  const panelStyle = { backgroundColor: "var(--admin-panel)", borderColor: "var(--admin-border)" };
  const softPanelStyle = { backgroundColor: "var(--admin-panel-soft)", borderColor: "var(--admin-border)" };
  const mutedStyle = { color: "var(--admin-muted)" };

  return (
    <div className="space-y-6" style={pageStyle}>
      <div className="rounded-3xl border p-6 shadow-xl shadow-black/10" style={panelStyle}>
        <p className="text-sm uppercase tracking-[0.24em]" style={mutedStyle}>Settings</p>
        <h2 className="mt-2 text-2xl font-semibold">Theme and accessibility</h2>
        <p className="mt-3 max-w-3xl text-sm" style={mutedStyle}>
          Use a light or dark administrative theme and adjust the portal scale for readability.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border p-6 shadow-xl shadow-black/10" style={softPanelStyle}>
          <h3 className="text-lg font-semibold">Theme</h3>
          <p className="mt-2 text-sm" style={mutedStyle}>Current theme: {theme}</p>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className="rounded-full px-4 py-2 text-sm font-medium transition"
              style={theme === "dark" ? { backgroundColor: "#0ea5e9", color: "#020617" } : { border: "1px solid var(--admin-border)", color: "var(--admin-muted)" }}
            >
              Dark
            </button>
            <button
              type="button"
              onClick={() => setTheme("light")}
              className="rounded-full px-4 py-2 text-sm font-medium transition"
              style={theme === "light" ? { backgroundColor: "#0ea5e9", color: "#020617" } : { border: "1px solid var(--admin-border)", color: "var(--admin-muted)" }}
            >
              Light
            </button>
          </div>
        </section>

        <section className="rounded-3xl border p-6 shadow-xl shadow-black/10" style={softPanelStyle}>
          <h3 className="text-lg font-semibold">Zoom level</h3>
          <p className="mt-2 text-sm" style={mutedStyle}>Current scale: {scale.toFixed(2)}x</p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={decreaseZoom} className="rounded-full border px-4 py-2 text-sm transition hover:bg-white/5" style={{ borderColor: "var(--admin-border)", color: "var(--admin-text)" }}>
              Zoom out
            </button>
            <button type="button" onClick={resetZoom} className="rounded-full border px-4 py-2 text-sm transition hover:bg-white/5" style={{ borderColor: "var(--admin-border)", color: "var(--admin-text)" }}>
              Reset
            </button>
            <button type="button" onClick={increaseZoom} className="rounded-full border px-4 py-2 text-sm transition hover:bg-white/5" style={{ borderColor: "var(--admin-border)", color: "var(--admin-text)" }}>
              Zoom in
            </button>
          </div>
        </section>
      </div>

      <div className="rounded-3xl border p-6 shadow-xl shadow-black/10" style={panelStyle}>
        <h3 className="text-lg font-semibold">Session</h3>
        <p className="mt-2 text-sm" style={mutedStyle}>
          Sign out ends the Clerk session and returns the browser to the public experience.
        </p>

        <div className="mt-5">
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}