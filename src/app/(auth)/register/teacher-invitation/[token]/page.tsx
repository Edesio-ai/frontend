"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFeatureFlag } from "@/contexts/feature-flags-context";
import { getRegisterInvitationPath } from "@/utils/functions/role.utils";
import TeacherInvitation from "../../_components/teacher-invitation";

export default function LegacyTeacherInvitationPage() {
  const isAuthNewDesign = useFeatureFlag("AuthNewDesign");
  const token = useParams<{ token: string }>().token;
  const router = useRouter();

  useEffect(() => {
    if (isAuthNewDesign && token) {
      router.replace(getRegisterInvitationPath(token));
    }
  }, [isAuthNewDesign, router, token]);

  if (isAuthNewDesign) {
    return null;
  }

  return <TeacherInvitation />;
}
