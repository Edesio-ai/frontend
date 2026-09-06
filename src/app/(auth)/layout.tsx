"use client";
import { useFeatureFlag } from "@/contexts/feature-flags-context";
import AuthAside from "./_components/auth-aside";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  const newAuthDesign = useFeatureFlag("AuthNewDesign");

  if (newAuthDesign) {
    return (
      <div className="flex h-dvh min-h-0 overflow-hidden font-sans">
        <AuthAside />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
          <div className="flex shrink-0 justify-end px-5 pt-5 sm:px-10">
            <LanguageSwitcher variant="segmented" refreshServer />
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center px-5 pb-10 pt-6 sm:px-10 sm:pb-[60px]">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return children;
}
