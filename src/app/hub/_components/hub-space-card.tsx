"use client";

import Link from "next/link";

import { Card } from "@/components/ui/card";
import { useTranslations } from "@/lib/i18n/client";
import type { HubSpace } from "../spaces";

type HubSpaceCardProps = {
  space: HubSpace;
};

export function HubSpaceCard({ space }: HubSpaceCardProps) {
  const t = useTranslations();
  const Icon = space.icon;

  return (
    <Link href={space.href} className="block min-w-0" data-testid={space.testId}>
      <Card className="aspect-square p-3 md:p-6 hover-elevate transition-all border-2 border-transparent h-full flex flex-col items-center justify-center text-center gap-2 md:gap-4">
        <div className={`w-10 h-10 md:w-16 md:h-16 rounded-xl ${space.iconWrap} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 md:h-8 md:w-8 ${space.iconClass}`} />
        </div>
        <div>
          <h2 className="text-sm md:text-xl font-semibold">{t.hub[space.titleKey]}</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-1 hidden sm:block">{t.hub[space.descKey]}</p>
        </div>
      </Card>
    </Link>
  );
}
