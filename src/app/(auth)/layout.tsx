"use client";
import { useFeatureFlag } from "@/contexts/feature-flags-context";
import AuthAside from "./_components/auth-aside";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  const newAuthDesign = useFeatureFlag("AuthNewDesign");

  if (newAuthDesign) {
    return (
      <div className="flex h-dvh min-h-0 overflow-hidden font-sans">
        <AuthAside />
        {children}
      </div>
    );
  }

  return children;
}
