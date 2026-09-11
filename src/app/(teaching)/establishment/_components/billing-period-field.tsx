"use client";

import { cn } from "@/lib/utils";

export type BillingPeriod = "monthly" | "annual";

export type BillingPeriodOption = {
  period: BillingPeriod;
  label: string;
  price: string;
  priceNote?: string;
  badge?: string;
};

type BillingPeriodFieldProps = {
  legend: string;
  value: BillingPeriod;
  options: BillingPeriodOption[];
  onChange: (period: BillingPeriod) => void;
};

export function BillingPeriodField({ legend, value, options, onChange }: BillingPeriodFieldProps) {
  return (
    <fieldset className="mb-5 border-none p-0">
      <legend className="mb-2.5 text-[12.5px] font-semibold text-landing-subtle">{legend}</legend>

      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const selected = option.period === value;

          return (
            <button
              key={option.period}
              type="button"
              onClick={() => onChange(option.period)}
              aria-pressed={selected}
              className={cn(
                "relative flex flex-col items-start gap-1 rounded-xl border px-3.5 py-3 text-left",
                "transition-all duration-200 ease-out active:scale-[0.98]",
                selected
                  ? "border-primary bg-primary-muted shadow-[0_2px_10px_rgba(99,102,241,0.12)]"
                  : "border-border bg-zinc-50 hover:border-primary/25 hover:bg-background",
              )}
            >
              <span className="flex w-full items-center justify-between gap-1.5">
                <span
                  className={cn("text-[12.5px] font-semibold", selected ? "text-primary" : "text-tertiary-foreground")}
                >
                  {option.label}
                </span>
                <span
                  className={cn(
                    "flex size-[15px] shrink-0 items-center justify-center rounded-full border",
                    selected ? "border-primary bg-primary" : "border-zinc-300 bg-background",
                  )}
                >
                  {selected ? <span className="size-[5px] rounded-full bg-background" /> : null}
                </span>
              </span>

              <span className="text-[17px] font-bold leading-tight tracking-[-0.01em] text-foreground">
                {option.price}
              </span>

              {option.priceNote ? (
                <span className="text-[11.5px] leading-snug text-landing-subtle">{option.priceNote}</span>
              ) : null}

              {option.badge ? (
                <span className="absolute -top-2 right-2.5 rounded-full bg-green-50 px-2 py-0.5 text-[10.5px] font-bold text-green-700">
                  {option.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
