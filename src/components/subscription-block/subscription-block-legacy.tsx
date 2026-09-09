"use client";

import Link from "next/link";
import { AlertTriangle, CreditCard, ExternalLink, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n/client";
import { useSubscriptionBlock } from "./use-subscription-block";

export function SubscriptionBlockLegacy({ children }: { children: React.ReactNode }) {
  const {
    isLoading,
    authLoading,
    subscriptionStatus,
    currentPlan,
    role,
    isOpeningPortal,
    handleOpenPortal,
    handleLogout,
  } = useSubscriptionBlock();
  const t = useTranslations();

  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (subscriptionStatus?.hasActiveSubscription) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none opacity-50 blur-sm filter">{children}</div>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-2xl">
          <div className="flex justify-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="size-8 text-amber-600" />
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold" data-testid="text-subscription-blocked-title">
              {subscriptionStatus?.isPending
                ? t.billing.blockModal.paymentPendingTitle
                : subscriptionStatus?.status
                  ? t.billing.blockModal.inactiveTitle
                  : t.billing.blockModal.requiredTitle}
            </h2>
            <p className="text-muted-foreground" data-testid="text-subscription-blocked-description">
              {subscriptionStatus?.isPending
                ? t.billing.blockModal.paymentPendingDesc
                : subscriptionStatus?.status
                  ? t.billing.subscriptionInactive
                  : t.billing.activateDesc}
            </p>
          </div>

          {subscriptionStatus?.isPending ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                <p className="text-sm text-amber-800 dark:text-amber-200">{t.billing.blockModal.bankHint}</p>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleOpenPortal}
                disabled={isOpeningPortal}
                data-testid="button-manage-payment"
              >
                {isOpeningPortal ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <ExternalLink className="mr-2 size-4" />
                )}
                {t.billing.blockModal.managePayment}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => window.location.reload()}
                data-testid="button-refresh-subscription"
              >
                {t.billing.blockModal.refreshPage}
              </Button>
            </div>
          ) : null}

          {!subscriptionStatus?.isPending && currentPlan ? (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="mb-2 flex items-center gap-3">
                  <CreditCard className="size-5 text-primary" />
                  <span className="font-semibold">{t.billing.planDetails[currentPlan.planKey].name}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {subscriptionStatus?.status ? t.billing.subscriptionInactive : t.billing.activateDesc}
                </p>
              </div>

              <Link href={`/billing/choose-plan?plan=${role}`}>
                <Button className="w-full" size="lg" data-testid="button-choose-plan">
                  {t.billing.subscribe}
                </Button>
              </Link>
            </div>
          ) : null}

          {!currentPlan && !subscriptionStatus?.isPending ? (
            <Link href={`/billing/choose-plan?plan=${role}`}>
              <Button className="w-full" size="lg" data-testid="button-choose-plan">
                {t.billing.subscribe}
              </Button>
            </Link>
          ) : null}

          <div className="space-y-3 border-t pt-4">
            <p className="text-center text-xs text-muted-foreground">
              {t.billing.contactUs}{" "}
              <a
                href="mailto:contact@edesio.ai"
                className="text-primary hover:underline"
                data-testid="link-contact-support"
              >
                contact@edesio.ai
              </a>
            </p>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={handleLogout}
              data-testid="button-logout-from-modal"
            >
              <LogOut className="mr-2 size-4" />
              {t.nav.logout}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
