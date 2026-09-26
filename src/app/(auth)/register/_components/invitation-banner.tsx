import { MailCheck } from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";

type InvitationBannerProps = {
  establishmentName: string;
};

export function InvitationBanner({ establishmentName }: InvitationBannerProps) {
  const t = useTranslations().auth.register.new.invitation;

  return (
    <div className="mb-6 flex items-center gap-2.5 rounded-lg bg-primary-muted px-3 py-2.5">
      <MailCheck className="size-[17px] shrink-0 text-primary" />
      <span className="text-[13.5px] text-indigo-800">
        {t.invitedBy} <strong className="font-bold">{establishmentName}</strong>
      </span>
    </div>
  );
}
