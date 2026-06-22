"use client";

import { useEffect } from "react";

const THEME_KEY = "admin-theme";
const SCALE_KEY = "admin-scale";

const applyPreferences = () => {
  if (typeof document === "undefined") {
    return;
  }

  const storedTheme = window.localStorage.getItem(THEME_KEY) || "dark";
  const storedScale = window.localStorage.getItem(SCALE_KEY) || "1";

  document.documentElement.dataset.adminTheme = storedTheme;
  document.documentElement.style.setProperty("--admin-scale", storedScale);
};

export { THEME_KEY, SCALE_KEY, applyPreferences };

export default function AdminPreferencesSync() {
  useEffect(() => {
    applyPreferences();

    const handleStorage = (event) => {
      if (event.key === THEME_KEY || event.key === SCALE_KEY) {
        applyPreferences();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return null;
}