"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "@/lib/i18n/client";
import { BillingService } from "@/services/billing.service";
import { isAdmin, USER_ROLE } from "@/utils/functions/role.utils";
import { SUBSCRIPTION_PLAN_CONFIG } from "./plan-config";

export type SubscriptionStatus = {
  hasActiveSubscription: boolean;
  status?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: number;
  isPending?: boolean;
  role?: string;
};

export type SubscriptionBlockView = "required" | "inactive" | "pending";

export function useSubscriptionBlock() {
  const { user, loading: authLoading, getUserRole, logout } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const t = useTranslations();
  const role = getUserRole();
  const currentPlan = role ? SUBSCRIPTION_PLAN_CONFIG[role] : null;

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      if (role === USER_ROLE.student || isAdmin(role)) {
        setSubscriptionStatus({ hasActiveSubscription: true, role: role ?? undefined });
        setIsLoading(false);
        return;
      }

      try {
        const data = await BillingService.getSubscriptionStatus();
        setSubscriptionStatus(data);
      } catch {
        console.error(t.billing.subscriptionCheckError);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      void checkSubscription();
    }
  }, [user, authLoading, role, t]);

  const view: SubscriptionBlockView = subscriptionStatus?.isPending
    ? "pending"
    : subscriptionStatus?.status
      ? "inactive"
      : "required";

  const handleOpenPortal = async () => {
    if (!user) return;

    setIsOpeningPortal(true);
    try {
      const { url } = await BillingService.getCustomerPortalUrl();
      window.location.href = url;
    } catch (error) {
      console.error("Error opening portal:", error);
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return {
    user,
    role,
    authLoading,
    isLoading,
    subscriptionStatus,
    currentPlan,
    view,
    isOpeningPortal,
    handleOpenPortal,
    handleLogout,
  };
}
