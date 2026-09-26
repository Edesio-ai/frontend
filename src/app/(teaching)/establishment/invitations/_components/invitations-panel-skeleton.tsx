import { Skeleton } from "@/components/ui/skeleton";
import { invitationItemClass } from "./invitation-status.styles";

function InvitationFieldSkeleton() {
  return (
    <div>
      <Skeleton className="mb-[6px] h-[13px] w-[72px]" />
      <Skeleton className="h-[42px] w-full rounded-[8px]" />
    </div>
  );
}

function InvitationRowSkeleton() {
  return (
    <div className={invitationItemClass()}>
      <div className="flex min-w-0 items-center gap-[12px]">
        <Skeleton className="h-[34px] w-[34px] shrink-0 rounded-full" />
        <div className="flex flex-col gap-[6px]">
          <Skeleton className="h-[14px] w-[140px]" />
          <Skeleton className="h-[12px] w-[180px]" />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-[12px]">
        <Skeleton className="h-[12px] w-[88px]" />
        <Skeleton className="h-[28px] w-[72px] rounded-[7px]" />
      </div>
    </div>
  );
}

function InvitationListSkeleton({ rows }: { rows: number }) {
  return (
    <section className="mb-[28px]">
      <div className="mb-[12px] flex items-center gap-[8px]">
        <Skeleton className="h-[13px] w-[88px]" />
        <Skeleton className="h-[20px] w-[28px] rounded-full" />
      </div>
      <div className="overflow-hidden rounded-[12px] border border-border bg-background">
        {Array.from({ length: rows }, (_, index) => (
          <InvitationRowSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

export function InvitationsPanelSkeleton() {
  return (
    <div className="w-full max-w-[840px]" aria-hidden>
      <section className="mb-[32px]">
        <Skeleton className="mb-[20px] h-[16px] w-[280px]" />
        <div className="rounded-[12px] border border-border bg-background p-[24px]">
          <div className="mb-[16px] grid grid-cols-2 gap-[16px]">
            <InvitationFieldSkeleton />
            <InvitationFieldSkeleton />
          </div>
          <div className="mb-[16px]">
            <InvitationFieldSkeleton />
          </div>
          <div className="mb-[20px]">
            <InvitationFieldSkeleton />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-[42px] w-[180px] rounded-[8px]" />
          </div>
        </div>
      </section>

      <InvitationListSkeleton rows={2} />
      <InvitationListSkeleton rows={2} />
    </div>
  );
}
