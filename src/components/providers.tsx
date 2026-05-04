"use client";

import type { ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "./ui/toaster";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      {children}
      <Toaster />
    </TooltipProvider>
  );
}