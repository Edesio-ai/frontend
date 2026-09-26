"use client";

import { useId } from "react";
import { Activity, Mail, UserPlus } from "lucide-react";
import { useLocale, useTranslations } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/functions/date.utils";
import { getInitials } from "@/utils/functions/string.utils";
import { useEstablishment } from "../../_contexts/establishment-context";
import { buildRecentActivityItems, type RecentActivityItem } from "../_utils/recent-activity";

const AVATAR_CLASS: Record<RecentActivityItem["type"], string> = {
  invited: "bg-[#FEF6E7] text-amber-700",
  joined: "bg-primary-muted text-primary",
};

export function RecentActivity() {
  const titleId = useId();
  const t = useTranslations().establishment.overview.recentActivity;
  const locale = useLocale();
  const { invitationTokens, invitationTokensLoading, teachers, loading } = useEstablishment();
  const items = buildRecentActivityItems(invitationTokens, teachers);

  if (loading || invitationTokensLoading) {
    return <RecentActivitySkeleton title={t.title} titleId={titleId} />;
  }

  return (
    <section aria-labelledby={titleId}>
      <h2 id={titleId} className="mb-[12px] text-[13px] font-semibold text-zinc-600">
        {t.title}
      </h2>

      <div
        className={cn(
          "overflow-hidden rounded-[12px] border",
          items.length === 0 ? "border-dashed border-zinc-200 bg-zinc-50/80" : "border-border bg-background",
        )}
      >
        {items.length === 0 ? (
          <div role="status" className="flex flex-col items-center px-[24px] py-[36px] text-center">
            <div className="mb-[12px] flex h-[40px] w-[40px] items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
              <Activity aria-hidden className="h-[18px] w-[18px]" />
            </div>
            <p className="m-0 text-[14px] font-semibold text-foreground">{t.emptyTitle}</p>
            <p className="m-0 mt-[6px] max-w-[320px] text-[13px] leading-[1.55] text-zinc-500">{t.emptyDescription}</p>
          </div>
        ) : (
          <ul>
            {items.map((item) => (
              <RecentActivityRow
                key={item.id}
                item={item}
                joinedLabel={t.joined}
                invitedLabel={t.invited}
                locale={locale}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function RecentActivityRow({
  item,
  joinedLabel,
  invitedLabel,
  locale,
}: {
  item: RecentActivityItem;
  joinedLabel: string;
  invitedLabel: string;
  locale: Locale;
}) {
  const Icon = item.type === "joined" ? UserPlus : Mail;
  const label = (item.type === "joined" ? joinedLabel : invitedLabel).replace("{name}", item.name);

  return (
    <li className="flex items-center gap-[12px] border-b border-zinc-100 px-[24px] py-[16px] last:border-b-0">
      <span
        aria-hidden
        className={cn(
          "flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-[12.5px] font-bold",
          AVATAR_CLASS[item.type],
        )}
      >
        {getInitials(item.name, { max: 2 })}
      </span>
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-[14px] font-medium text-foreground">{label}</p>
        <p className="m-0 mt-[2px] flex items-center gap-[6px] text-[12px] text-zinc-400">
          <Icon className="h-[13px] w-[13px] shrink-0" />
          <time dateTime={item.at}>{formatRelativeTime(item.at, locale)}</time>
        </p>
      </div>
    </li>
  );
}

function RecentActivitySkeleton({ title, titleId }: { title: string; titleId: string }) {
  return (
    <section aria-busy="true" aria-labelledby={titleId}>
      <h2 id={titleId} className="mb-[12px] text-[13px] font-semibold text-zinc-600">
        {title}
      </h2>
      <div className="overflow-hidden rounded-[12px] border border-border bg-background">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-[12px] border-b border-zinc-100 px-[24px] py-[16px] last:border-b-0"
          >
            <div className="h-[34px] w-[34px] shrink-0 animate-pulse rounded-full bg-zinc-100" />
            <div className="min-w-0 flex-1">
              <div className="h-[14px] w-[220px] max-w-full animate-pulse rounded bg-zinc-100" />
              <div className="mt-[8px] h-[10px] w-[88px] animate-pulse rounded bg-zinc-100" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
