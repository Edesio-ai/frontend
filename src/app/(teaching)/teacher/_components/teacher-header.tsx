"use client";
import { GraduationCap, Lightbulb, Loader2, LogOut, UserCog } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/i18n/client";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { SuggestionsModal } from "@/components/SuggestionsModal";
import { MobileInstallBanner, MobileInstallModal } from "@/components/ui/mobile-install-modal";

export function TeacherHeader() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  const t = useTranslations();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push("/");
  };

  if (!user) return null;

  const firstname = user.metadata?.firstname || "Professeur";

  return (
    <>
      <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 gap-3 sm:gap-6">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold shrink-0">
              <img src="/edesio-logo-square.png" alt="Edesio" className="w-10 h-10 rounded-lg object-cover" />
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Edesio</span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSuggestionsModal(true)}
                className="border-amber-300 text-amber-600 dark:border-amber-600 dark:text-amber-400"
                data-testid="button-suggestions"
              >
                <Lightbulb className="h-4 w-4 mr-1.5" />
                {t.nav.suggestions}
              </Button>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">{firstname}</span>
              </div>
              <Link href="/profile">
                <Button variant="ghost" size="sm" data-testid="button-profile">
                  <UserCog className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{t.nav.profile}</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                data-testid="button-logout"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{t.nav.logout}</span>
                  </>
                )}
              </Button>
            </div>
            <LanguageSwitcher className="shrink-0" />
          </div>
        </div>
      </header>

      <MobileInstallBanner onOpenModal={() => setShowInstallModal(true)} />
      <MobileInstallModal open={showInstallModal} onOpenChange={setShowInstallModal} />
      <SuggestionsModal open={showSuggestionsModal} onOpenChange={setShowSuggestionsModal} category="teacher" />
    </>
  );
}
