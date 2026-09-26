import { cn } from "@/lib/utils";

export type InvitationStatus = "pending" | "accepted";

const tone = {
  pending: "bg-[#FEF6E7] text-amber-700",
  accepted: "bg-[#EEF9F0] text-green-700",
} as const satisfies Record<InvitationStatus, string>;

export const invitationStyles = {
  badge: tone,
  avatar: {
    pending: tone.pending,
    accepted: "bg-primary-muted text-primary",
  } satisfies Record<InvitationStatus, string>,
  item: {
    base: "flex items-center justify-between gap-[20px] border-b border-zinc-100 px-[24px] py-[16px] last:border-b-0",
    expired: "bg-zinc-50/80 opacity-60",
  },
} as const;

export function invitationItemClass(expired = false) {
  return cn(invitationStyles.item.base, expired && invitationStyles.item.expired);
}
