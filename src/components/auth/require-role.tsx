"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useAuth } from "@/contexts/auth-context";
import { canAccessModule, getPostLoginPath } from "@/utils/functions/role.utils";
import type { PublicRole } from "@/types";

type RequireRoleProps = {
  module: PublicRole;
  children: React.ReactNode;
};

export function RequireRole({ module, children }: RequireRoleProps) {
  const router = useRouter();
  const { user, loading, getUserRole } = useAuth();
  const role = getUserRole();
  const canAccess = Boolean(user && canAccessModule(role, module));

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!canAccessModule(role, module)) {
      router.replace(getPostLoginPath(role));
    }
  }, [loading, user, role, module, router]);

  if (loading || !canAccess) {
    return <LoadingSpinner />;
  }

  return children;
}
