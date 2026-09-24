"use client";
import { useFeatureFlag } from "@/contexts/feature-flags-context";
import AuthAside from "./_components/auth-aside";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  const newAuthDesign = useFeatureFlag("AuthNewDesign");

  if (newAuthDesign) {
    return (
      <div className="relative flex h-dvh overflow-hidden font-sans">
        <AuthAside />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
          <div className="flex shrink-0 justify-end px-5 pt-5 sm:px-10">
            <LanguageSwitcher variant="segmented" refreshServer />
          </div>
          <div className="relative min-h-0 flex-1 overflow-y-auto">
            <div className="flex min-h-full flex-col px-5 py-6 sm:px-10 sm:pb-[60px]">
              <div className="mx-auto my-auto flex w-full justify-center">{children}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
