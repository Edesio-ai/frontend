import { Cpu, MapPin, ShieldCheck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const statsIcons: Record<string, LucideIcon> = {
  "shield-check": ShieldCheck,
  "map-pin": MapPin,
  cpu: Cpu,
};

type StatsBannerItemProps = {
  icon: string;
  value: string;
  label: string;
  className?: string;
};

export function StatsBannerItem({ icon, value, label, className }: StatsBannerItemProps) {
  const Icon = statsIcons[icon] ?? ShieldCheck;

  return (
    <div
      className={cn(
        "flex items-center gap-4 border-b border-white/15 py-5 last:border-b-0 md:flex-col md:border-b-0 md:py-0 md:text-center",
        className,
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-white/14 md:mb-3">
        <Icon className="size-5 text-white" aria-hidden="true" />
      </div>
      <div className="min-w-0 md:w-full">
        <p className="mb-0.5 text-lg font-extrabold tracking-tight text-white md:mb-1 md:text-xl">{value}</p>
        <p className="text-[13px] leading-snug text-white/75 md:leading-normal">{label}</p>
      </div>
    </div>
  );
}
