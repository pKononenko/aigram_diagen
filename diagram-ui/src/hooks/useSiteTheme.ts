import { useEffect, useState } from "react";
import type { SiteTheme } from "../types";

export default function useSiteTheme() {
  const [siteTheme, setSiteTheme] = useState<SiteTheme>(
    () => (localStorage.getItem("siteTheme") as SiteTheme) || "light"
  );
  useEffect(() => {
    const isDark = siteTheme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("siteTheme", siteTheme);
  }, [siteTheme]);
  return [siteTheme, setSiteTheme] as const;
}
