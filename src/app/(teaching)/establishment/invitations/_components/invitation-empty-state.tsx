import { CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { invitationStyles, type InvitationStatus } from "./invitation-status.styles";

const EMPTY_ICON = {
  pending: Clock,
  accepted: CheckCircle2,
} as const;

type InvitationEmptyStateProps = {
  status: InvitationStatus;
  title: string;
  description: string;
};

export function InvitationEmptyState({ status, title, description }: InvitationEmptyStateProps) {
  const Icon = EMPTY_ICON[status];

  return (
    <div role="status" className="flex flex-col items-center px-[24px] py-[36px] text-center">
      <div
        className={cn(
          "mb-[12px] flex h-[40px] w-[40px] items-center justify-center rounded-full",
          invitationStyles.badge[status],
        )}
      >
        <Icon aria-hidden className="h-[18px] w-[18px]" />
      </div>
      <p className="m-0 text-[14px] font-semibold text-foreground">{title}</p>
      <p className="m-0 mt-[6px] max-w-[320px] text-[13px] leading-[1.55] text-zinc-500">{description}</p>
    </div>
  );
}
