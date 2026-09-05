import { BarChart3, Clock, MessageCircle, ShieldCheck, Sparkles, Zap, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const benefitIcons: Record<string, LucideIcon> = {
  zap: Zap,
  "bar-chart-3": BarChart3,
  "message-circle": MessageCircle,
  "shield-check": ShieldCheck,
  clock: Clock,
  sparkles: Sparkles,
};

const benefitIconStyles: Record<string, string> = {
  zap: "bg-primary-muted text-primary",
  "bar-chart-3": "bg-amber-100 text-amber-700",
  "message-circle": "bg-green-100 text-green-700",
  "shield-check": "bg-primary-muted text-primary",
  clock: "bg-amber-100 text-amber-700",
  sparkles: "bg-green-100 text-green-700",
};

type BenefitsItemProps = {
  icon: string;
  title: string;
  description: string;
  index: number;
};

export function BenefitsItem({ icon, title, description, index }: BenefitsItemProps) {
  const Icon = benefitIcons[icon] ?? Zap;

  return (
    <article data-testid={`card-benefit-${index + 1}`}>
      <div
        className={cn(
          "mb-4 flex size-[42px] items-center justify-center rounded-[11px]",
          benefitIconStyles[icon] ?? "bg-primary-muted text-primary",
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-[15px] font-bold text-foreground" data-testid={`text-benefit-${index + 1}-title`}>
        {title}
      </h3>
      <p className="text-[13px] leading-[1.6] text-tertiary-foreground">{description}</p>
    </article>
  );
}
