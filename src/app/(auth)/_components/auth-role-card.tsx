import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthRoleCard({
  href,
  title,
  subtitle,
  icon,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-[14px] rounded-[10px] border border-border p-4 no-underline transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary-muted/50 hover:shadow-[0_8px_20px_-12px_rgba(24,24,27,0.18)]"
    >
      <div className="flex size-11 items-center justify-center rounded-[10px] bg-primary-muted">{icon}</div>
      <div>
        <h3 className="text-[15px] font-bold text-foreground">{title}</h3>
        <p className="text-[12.5px] text-tertiary-foreground">{subtitle}</p>
      </div>
    </Link>
  );
}
