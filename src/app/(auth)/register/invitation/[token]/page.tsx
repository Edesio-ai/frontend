import { Suspense } from "react";
import { getInvitationPreview } from "@/server/invitation-token";
import RegisterInvitation from "../../_components/register-invitation";
import { InvitationValidating } from "../../_components/invitation-validating";

type RegisterInvitationPageProps = {
  params: Promise<{ token: string }>;
};

async function RegisterInvitationContent({ token }: { token: string }) {
  const preview = await getInvitationPreview(token);

  return <RegisterInvitation token={token} preview={preview.ok ? preview.data : null} />;
}

export default async function RegisterInvitationPage({ params }: RegisterInvitationPageProps) {
  const { token } = await params;

  return (
    <Suspense fallback={<InvitationValidating />}>
      <RegisterInvitationContent token={token} />
    </Suspense>
  );
}
