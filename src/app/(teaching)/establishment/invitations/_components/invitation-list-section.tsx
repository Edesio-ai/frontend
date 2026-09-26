"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { InvitationEmptyState } from "./invitation-empty-state";
import { invitationStyles, type InvitationStatus } from "./invitation-status.styles";

type InvitationListSectionProps = {
  title: string;
  status: InvitationStatus;
  count: number;
  emptyTitle: string;
  emptyDescription: string;
  children: ReactNode;
};

export function InvitationListSection({
  title,
  status,
  count,
  emptyTitle,
  emptyDescription,
  children,
}: InvitationListSectionProps) {
  const titleId = useId();
  const isEmpty = count === 0;

  return (
    <section aria-labelledby={titleId} className="mb-[28px]">
      <h2 id={titleId} className="mb-[12px] flex items-center gap-[8px] text-[13px] font-semibold text-zinc-600">
        {title}
        <span className={cn("rounded-full px-[8px] py-[2px] text-[11.5px] font-bold", invitationStyles.badge[status])}>
          {count}
        </span>
      </h2>

      <div
        className={cn(
          "overflow-hidden rounded-[12px] border",
          isEmpty ? "border-dashed border-zinc-200 bg-zinc-50/80" : "border-border bg-background",
        )}
      >
        {isEmpty ? (
          <InvitationEmptyState status={status} title={emptyTitle} description={emptyDescription} />
        ) : (
          <ul>{children}</ul>
        )}
      </div>
    </section>
  );
}
