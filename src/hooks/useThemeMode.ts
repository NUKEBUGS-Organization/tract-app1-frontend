import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "wholesaler-theme";

export type ThemeMode = "light" | "dark";

export function useThemeMode(role: "partner" | "other"): {
  mode: ThemeMode;
  toggleMode: () => void;
  isLight: boolean;
} {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (role !== "partner") return "light";
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") return stored;
    } catch {
      // ignore
    }
    return "dark"; // wholesaler default
  });

  useEffect(() => {
    if (role !== "partner") return;
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
    }

    document.documentElement.setAttribute("data-wholesaler-theme", mode);
  }, [mode, role]);


  useEffect(() => {
    if (role !== "partner") return;
    document.documentElement.setAttribute("data-wholesaler-theme", mode);
  }, []);

  const toggleMode = useCallback(() => {
    if (role !== "partner") return;
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  }, [role]);

  return { mode, toggleMode, isLight: mode === "light" };
}
