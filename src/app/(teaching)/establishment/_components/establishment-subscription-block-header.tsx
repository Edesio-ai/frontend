"use client";

import { useTranslations } from "@/lib/i18n/client";

type EstablishmentSubscriptionBlockHeaderProps = {
  icon: React.ReactNode;
};

export function EstablishmentSubscriptionBlockHeader({ icon }: EstablishmentSubscriptionBlockHeaderProps) {
  const t = useTranslations();
  const bt = t.billing.blockModal.new;
  return (
    <header className="mb-7 flex items-center gap-3.5">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-[11px] border border-indigo-200 bg-primary-muted text-primary">
        {icon}
      </div>
      <div>
        <h2 className="mb-0.5 text-[19px] font-bold tracking-[-0.01em] text-foreground">{bt.requiredTitle}</h2>
        <p className="text-[12.5px] text-landing-subtle">{bt.kickerSubscription}</p>
      </div>
    </header>
  );
}
