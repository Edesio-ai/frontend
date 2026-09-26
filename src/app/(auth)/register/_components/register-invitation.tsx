"use client";

import { useFeatureFlag, useFeatureFlagsHydrated } from "@/contexts/feature-flags-context";
import type { InvitationTokenPreview } from "@/types/invitation-token.type";
import TeacherInvitation from "./teacher-invitation";
import TeacherInvitationNew from "./teacher-invitation-new";

type RegisterInvitationProps = {
  token: string;
  preview: InvitationTokenPreview | null;
};

export default function RegisterInvitation({ token, preview }: RegisterInvitationProps) {
  const hydrated = useFeatureFlagsHydrated();
  const isAuthNewDesign = useFeatureFlag("AuthNewDesign");

  if (!hydrated) {
    return null;
  }

  if (!isAuthNewDesign) {
    return <TeacherInvitation token={token} preview={preview} />;
  }

  return <TeacherInvitationNew token={token} preview={preview} />;
}
