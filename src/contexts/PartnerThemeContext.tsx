import { createContext, useContext } from "react";

export type PartnerTheme = "light" | "dark";

export const PartnerThemeContext = createContext<PartnerTheme>("dark");

export function usePartnerThemeContext(): PartnerTheme {
  return useContext(PartnerThemeContext);
}
