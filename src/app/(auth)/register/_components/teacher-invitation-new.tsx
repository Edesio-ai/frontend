"use client";

import { useState } from "react";
import AuthTitle from "../../_components/auth-title";
import { useTranslations } from "@/lib/i18n/client";
import type { InvitationTokenPreview } from "@/types/invitation-token.type";
import { InvitationBanner } from "./invitation-banner";
import InvitationExpired from "./invitation-expired";
import InvitationForm from "./invitation-form";
import { InvitationIdentityCard } from "./invitation-identity-card";
import { InvitationLoginLink } from "./invitation-login-link";

type TeacherInvitationNewProps = {
  token: string;
  preview: InvitationTokenPreview | null;
};

export default function TeacherInvitationNew({ token, preview }: TeacherInvitationNewProps) {
  const t = useTranslations().auth.register.new.invitation;
  const [cachedPreview] = useState(preview);
  console.log("🚀 ~ TeacherInvitationNew ~ cachedPreview:", cachedPreview);

  if (!cachedPreview) {
    return <InvitationExpired />;
  }

  return (
    <div className="w-full max-w-[400px]">
      <InvitationBanner establishmentName={cachedPreview.establishmentName} />
      <AuthTitle title={t.title} subtitle={t.subtitle} />
      <InvitationIdentityCard
        firstname={cachedPreview.firstname}
        lastname={cachedPreview.lastname}
        email={cachedPreview.maskedEmail}
      />
      <InvitationForm token={token} />
      <InvitationLoginLink />
    </div>
  );
}
