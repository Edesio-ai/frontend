"use client";

import { cn } from "@/lib/utils";

type PricingBillingToggleProps = {
  isAnnual: boolean;
  onChange: (isAnnual: boolean) => void;
  monthlyLabel: string;
  annualLabel: string;
  discountLabel: string;
};

export function PricingBillingToggle({
  isAnnual,
  onChange,
  monthlyLabel,
  annualLabel,
  discountLabel,
}: PricingBillingToggleProps) {
  return (
    <div className="mb-9 flex flex-wrap items-center gap-3">
      <div
        className="inline-flex items-center gap-0.5 rounded-[7px] bg-muted p-0.5"
        role="group"
        aria-label={monthlyLabel}
        data-testid="switch-billing-period"
      >
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            "rounded-[5px] px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-200",
            !isAnnual
              ? "bg-background text-foreground shadow-sm"
              : "text-tertiary-foreground hover:bg-background/60 hover:text-foreground",
          )}
          aria-pressed={!isAnnual}
        >
          {monthlyLabel}
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            "rounded-[5px] px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-200",
            isAnnual
              ? "bg-background text-foreground shadow-sm"
              : "text-tertiary-foreground hover:bg-background/60 hover:text-foreground",
          )}
          aria-pressed={isAnnual}
        >
          {annualLabel}
        </button>
      </div>
      {isAnnual && (
        <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-700">{discountLabel}</span>
      )}
    </div>
  );
}
