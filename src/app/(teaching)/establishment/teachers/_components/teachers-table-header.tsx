"use client";

import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTranslations } from "@/lib/i18n/client";
import { HEAD_CLASS } from "./teachers-table.styles";

export function TeachersTableHeader() {
  const t = useTranslations().establishment.teachersPage.columns;

  return (
    <>
      <colgroup>
        <col />
        <col className="w-[18%]" />
        <col className="w-[18%]" />
        <col className="w-[112px]" />
        <col className="w-[64px]" />
      </colgroup>

      <TableHeader className="bg-zinc-50">
        <TableRow className="border-border hover:bg-transparent">
          <TableHead scope="col" className={HEAD_CLASS}>
            {t.teacher}
          </TableHead>
          <TableHead scope="col" className={HEAD_CLASS}>
            {t.classes}
          </TableHead>
          <TableHead scope="col" className={HEAD_CLASS}>
            {t.students}
          </TableHead>
          <TableHead scope="col" className={HEAD_CLASS}>
            {t.status}
          </TableHead>
          <TableHead scope="col" className={HEAD_CLASS}>
            <span className="sr-only">{t.actions}</span>
          </TableHead>
        </TableRow>
      </TableHeader>
    </>
  );
}
