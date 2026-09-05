import { Check } from "lucide-react";

type ForWhoSegmentProps = {
  title: string;
  subtitle: string;
  bullets: string[];
};

export function ForWhoSegment({ title, subtitle, bullets }: ForWhoSegmentProps) {
  return (
    <div className="border-r border-b border-border px-6 py-6.5">
      <h3 className="mb-1 text-[15px] font-bold text-foreground">{title}</h3>
      <p className="mb-4 text-xs text-landing-subtle">{subtitle}</p>
      <ul className="flex flex-col gap-[9px]">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2">
            <Check className="mt-0.5 size-[13px] shrink-0 text-primary" aria-hidden="true" />
            <span className="text-[13px] leading-[1.5] text-landing-nav-link">{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
