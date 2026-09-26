"use client";

import { useTranslations } from "@/lib/i18n/client";
import { useEstablishment } from "../../_contexts/establishment-context";

const STAT_LABEL_CLASS = "m-0 text-[12px] font-semibold uppercase tracking-[0.05em] text-zinc-400";

export function EstablishmentStatsBanner() {
  const t = useTranslations().establishment.overview.stats;
  const { stats } = useEstablishment();

  return (
    <div className="mb-[44px] grid grid-cols-1 overflow-hidden rounded-[14px] border border-border bg-background min-[860px]:grid-cols-[1.3fr_1fr_1fr]">
      <div className="border-b border-zinc-100 px-[28px] py-[26px] min-[860px]:border-b-0 min-[860px]:border-r">
        <p className={`${STAT_LABEL_CLASS} mb-[12px]`}>{t.activeStudents}</p>
        <p className="m-0 text-[42px] font-extrabold leading-none tracking-[-0.02em] text-foreground">
          {stats.totalStudents}
        </p>
        <p className="mb-0 mt-[10px] text-[13px] text-zinc-500">
          {t.spreadAcrossClasses.replace("{count}", String(stats.totalSessions))}
        </p>
      </div>

      <div className="flex flex-col justify-center border-b border-zinc-100 px-[28px] py-[26px] min-[860px]:border-b-0 min-[860px]:border-r">
        <p className={`${STAT_LABEL_CLASS} mb-[10px]`}>{t.teachers}</p>
        <p className="m-0 text-[26px] font-bold tracking-[-0.01em] text-foreground">{stats.totalTeachers}</p>
      </div>

      <div className="flex flex-col justify-center px-[28px] py-[26px]">
        <p className={`${STAT_LABEL_CLASS} mb-[10px]`}>{t.classes}</p>
        <p className="m-0 text-[26px] font-bold tracking-[-0.01em] text-foreground">{stats.totalSessions}</p>
      </div>
    </div>
  );
}
