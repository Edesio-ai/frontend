import { Suspense } from "react";
import { getInvitationPreview } from "@/server/invitation-token";
import { InvitationValidating } from "../../_components/invitation-validating";
import TeacherInvitation from "../../_components/teacher-invitation";

type LegacyTeacherInvitationRouteProps = {
  params: Promise<{ token: string }>;
};

async function LegacyTeacherInvitationContent({ token }: { token: string }) {
  const preview = await getInvitationPreview(token);

  return <TeacherInvitation token={token} preview={preview.ok ? preview.data : null} />;
}

export default async function LegacyTeacherInvitationRoute({ params }: LegacyTeacherInvitationRouteProps) {
  const { token } = await params;

  return (
    <Suspense fallback={<InvitationValidating />}>
      <LegacyTeacherInvitationContent token={token} />
    </Suspense>
  );
}
