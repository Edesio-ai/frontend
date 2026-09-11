"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type EstablishmentNavContextValue = {
  mobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
};

const EstablishmentNavContext = createContext<EstablishmentNavContextValue | null>(null);

const DESKTOP_BREAKPOINT_PX = 860;

export function EstablishmentNavProvider({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT_PX}px)`);

    const handleChange = () => {
      if (mediaQuery.matches) {
        setMobileNavOpen(false);
      }
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

  const value = useMemo(
    () => ({ mobileNavOpen, openMobileNav, closeMobileNav }),
    [mobileNavOpen, openMobileNav, closeMobileNav],
  );

  return <EstablishmentNavContext.Provider value={value}>{children}</EstablishmentNavContext.Provider>;
}

export function useEstablishmentNav() {
  const context = useContext(EstablishmentNavContext);
  if (!context) {
    throw new Error("useEstablishmentNav must be used within EstablishmentNavProvider");
  }
  return context;
}
