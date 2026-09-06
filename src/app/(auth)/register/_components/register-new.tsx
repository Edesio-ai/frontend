"use client";

import Link from "next/link";
import { Building2, GraduationCap, Sparkles, Users } from "lucide-react";
import AuthRoleCard from "../../_components/auth-role-card";
import AuthTitle from "../../_components/auth-title";
import { useTranslations } from "@/lib/i18n/client";
import { getRegisterRolePath, USER_ROLE } from "@/utils/functions/role.utils";

const sectionTitleClassName = "mb-2.5 text-xs font-bold uppercase tracking-[0.04em] text-landing-subtle";

export default function RegisterNew() {
  const t = useTranslations().auth.register.new;

  const particular = {
    href: getRegisterRolePath(USER_ROLE.selfLearner),
    title: t.roles.solo.title,
    subtitle: t.roles.solo.description,
    icon: <Sparkles className="size-5 text-primary" />,
  };

  const school = [
    {
      href: getRegisterRolePath(USER_ROLE.student),
      title: t.roles.student.title,
      subtitle: t.roles.student.description,
      icon: <GraduationCap className="size-5 text-primary" />,
    },
    {
      href: getRegisterRolePath(USER_ROLE.teacher),
      title: t.roles.teacher.title,
      subtitle: t.roles.teacher.description,
      icon: <Users className="size-5 text-primary" />,
    },
    {
      href: getRegisterRolePath(USER_ROLE.establishment),
      title: t.roles.establishment.title,
      subtitle: t.roles.establishment.description,
      icon: <Building2 className="size-5 text-primary" />,
    },
  ];

  return (
    <div className="w-full max-w-[400px]">
      <AuthTitle title={t.title} subtitle={t.subtitle} />

      <div className="mb-6">
        <h2 className={sectionTitleClassName}>{t.forIndividuals}</h2>
        <div className="flex flex-col gap-3.5">
          <AuthRoleCard {...particular} />
        </div>
      </div>

      <div className="mb-6">
        <h2 className={sectionTitleClassName}>{t.forSchools}</h2>
        <div className="flex flex-col gap-3.5">
          {school.map((role) => (
            <AuthRoleCard key={role.href} {...role} />
          ))}
        </div>
      </div>

      <p className="text-center text-[13.5px] text-tertiary-foreground">
        {t.alreadyHaveAccount}{" "}
        <Link href="/login" className="font-semibold text-primary no-underline hover:text-primary/80">
          {t.login}
        </Link>
      </p>
    </div>
  );
}
