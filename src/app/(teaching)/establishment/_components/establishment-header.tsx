"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Lightbulb, LogOut, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SuggestionsModal } from "@/components/SuggestionsModal";
import { MobileInstallBanner, MobileInstallModal } from "@/components/ui/mobile-install-modal";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslations } from "@/lib/i18n/client";
import { useAuth } from "@/contexts/auth-context";
import { useEstablishment } from "../_contexts/establishment-context";

export function EstablishmentHeader() {
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();
  const t = useTranslations();
  const { establishment } = useEstablishment();

  const handleSignOut = async () => {
    await logout();
    router.push("/");
  };

  return (
    <>
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-3 sm:gap-6">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg" data-testid="text-establishment-name">
                {establishment?.name || t.establishment.title}
              </h1>
              <p className="text-sm text-muted-foreground">{t.establishment.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSuggestionsModal(true)}
              className="border-amber-300 text-amber-600 dark:border-amber-600 dark:text-amber-400"
              data-testid="button-suggestions"
            >
              <Lightbulb className="h-4 w-4 mr-1.5" />
              Suggestions
            </Button>
            <Link href="/profile">
              <Button variant="ghost" data-testid="button-profile">
                <UserCog className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{t.nav.profile}</span>
              </Button>
            </Link>
            <Button variant="ghost" onClick={handleSignOut} data-testid="button-signout">
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{t.nav.logout}</span>
            </Button>
          </div>

          <LanguageSwitcher className="shrink-0" />
        </div>
      </header>
      <SuggestionsModal open={showSuggestionsModal} onOpenChange={setShowSuggestionsModal} category="establishment" />
      <MobileInstallBanner onOpenModal={() => setShowInstallModal(true)} />
      <MobileInstallModal open={showInstallModal} onOpenChange={setShowInstallModal} />
    </>
  );
}
