import { GraduationCap } from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";
import { getInitials } from "@/utils/functions/string.utils";
import { getUserDisplayName } from "@/utils/functions/user.utils";

type InvitationIdentityCardProps = {
  firstname: string;
  lastname: string;
  email: string;
};

export function InvitationIdentityCard({ firstname, lastname, email }: InvitationIdentityCardProps) {
  const t = useTranslations().auth.register.new.invitation;
  const fullName = getUserDisplayName(firstname, lastname);

  return (
    <div className="mb-6 flex items-center gap-3 rounded-[10px] border border-border px-3.5 py-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-[13px] font-bold text-zinc-600">
        {getInitials(fullName, { max: 2, fallback: "" })}
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-px truncate text-sm font-semibold">{fullName}</p>
        <p className="truncate text-[12.5px] text-tertiary-foreground">{email}</p>
      </div>
      <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-zinc-600">
        <GraduationCap className="size-[13px]" />
        {t.role}
      </span>
    </div>
  );
}
