"use client";

import { notFound, redirect, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, GraduationCap, Sparkles, Users, type LucideIcon } from "lucide-react";
import { useFeatureFlag, useFeatureFlagsHydrated } from "@/contexts/feature-flags-context";
import { isPublicRole } from "@/utils/functions/role.utils";
import { USER_ROLE, type PublicRole } from "@/types";
import { useTranslations } from "@/lib/i18n/client";
import RegisterForm from "../_components/register-form";

type RoleChipKey = "solo" | "student" | "teacher" | "establishment";

const ROLE_CHIP: Record<PublicRole, { icon: LucideIcon; key: RoleChipKey }> = {
  [USER_ROLE.selfLearner]: { icon: Sparkles, key: "solo" },
  [USER_ROLE.student]: { icon: Users, key: "student" },
  [USER_ROLE.teacher]: { icon: GraduationCap, key: "teacher" },
  [USER_ROLE.establishment]: { icon: Building2, key: "establishment" },
};

export default function RegisterRolePage() {
  const hydrated = useFeatureFlagsHydrated();
  const isAuthNewDesign = useFeatureFlag("AuthNewDesign");
  const role = useParams<{ role: string }>().role;
  const t = useTranslations().auth.register.new;

  if (!hydrated) {
    return null;
  }

  if (!isAuthNewDesign) {
    notFound();
  }

  if (!isPublicRole(role)) {
    redirect("/register");
  }

  const chip = ROLE_CHIP[role];
  const ChipIcon = chip.icon;
  const showEstablishmentRequired = role === USER_ROLE.establishment;

  return (
    <div className="w-full max-w-[400px]">
      <Link
        href="/register"
        className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-tertiary-foreground no-underline hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        {t.changeProfile}
      </Link>

      <div className="mb-6 flex items-center gap-2.5 rounded-lg bg-primary-muted px-3 py-2.5">
        <ChipIcon className="size-[17px] text-primary" />
        <span className="text-[13.5px] font-semibold text-indigo-800">{t.roles[chip.key].chip}</span>
      </div>

      <RegisterForm role={role} showEstablishmentRequired={showEstablishmentRequired} />

      <p className="text-center text-[13.5px] text-tertiary-foreground">
        {t.alreadyHaveAccount}{" "}
        <Link href="/login" className="font-semibold text-primary no-underline hover:text-primary/80">
          {t.login}
        </Link>
      </p>
    </div>
  );
}
