"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Loader } from "@/app/_components/loader";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "@/lib/i18n/client";
import { getPostLoginPath, isAdmin } from "@/utils/functions/role.utils";
import { HubSpaceCard } from "./_components/hub-space-card";
import { HUB_SPACES } from "./spaces";

export default function Hub() {
  const { user, loading, logout, getUserRole } = useAuth();
  const router = useRouter();
  const t = useTranslations();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const role = getUserRole();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!isAdmin(role)) {
      router.replace(getPostLoginPath(role));
    }
  }, [loading, user, role, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push("/");
  };

  if (loading || !user || !isAdmin(role)) {
    return <Loader text={t.hub.loading} />;
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 gap-3 sm:gap-6">
            <Link href="/hub" className="flex items-center gap-2 text-xl font-bold shrink-0">
              <img src="/edesio-logo-square.png" alt="Edesio" className="w-10 h-10 rounded-lg object-cover" />
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Edesio</span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
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
              <LanguageSwitcher className="shrink-0" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center max-w-6xl w-full mx-auto px-4 md:px-8 py-10 md:py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" data-testid="text-hub-title">
            {t.hub.title}
          </h1>
          <p className="text-muted-foreground">{t.hub.subtitle}</p>
        </div>

        <div className="grid grid-cols-4 gap-3 md:gap-6">
          {HUB_SPACES.map((space) => (
            <HubSpaceCard key={space.href} space={space} />
          ))}
        </div>
      </main>
    </div>
  );
}
