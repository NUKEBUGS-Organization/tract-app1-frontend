/**
 * usePartnerTheme
 *
 * Reads the partner/wholesaler theme from the nearest PartnerThemeContext
 * provider (set synchronously by DashboardLayout on every toggle).
 *
 * Falls back to reading localStorage + watching the DOM attribute for any
 * component that is rendered outside the layout (e.g. portals / modals).
 */
import { useContext, useEffect, useState } from "react";
import { PartnerThemeContext } from "../contexts/PartnerThemeContext";

export type PartnerTheme = "light" | "dark";
const STORAGE_KEY = "wholesaler-theme";

export function usePartnerTheme(): PartnerTheme {
  // Primary path
  const contextTheme = useContext(PartnerThemeContext);
  return contextTheme;
}

/**
 * Fallback hook for components rendered outside the DashboardLayout tree ->Uses localStorage + MutationObserver.
 */
export function usePartnerThemeFallback(): PartnerTheme {
  const [theme, setTheme] = useState<PartnerTheme>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") return stored;
    } catch {
    }
    return "dark";
  });

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === "light" || e.newValue === "dark")) {
        setTheme(e.newValue);
      }
    };

    const observer = new MutationObserver(() => {
      const attr = document.documentElement.getAttribute("data-wholesaler-theme");
      if (attr === "light" || attr === "dark") setTheme(attr);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-wholesaler-theme"],
    });

    window.addEventListener("storage", handleStorage);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return theme;
}
