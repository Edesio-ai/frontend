"use client";

import { Trash2 } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n/client";
import type { EstablishmentTeacherListItem } from "@/types";
import { getInitials } from "@/utils/functions/string.utils";
import { TeacherStatusBadge } from "./teacher-status-badge";
import { CELL_CLASS, ROW_CLASS } from "./teachers-table.styles";

type TeacherTableRowProps = {
  teacher: EstablishmentTeacherListItem;
  onRemove: (teacher: EstablishmentTeacherListItem) => void;
};

export function TeacherTableRow({ teacher, onRemove }: TeacherTableRowProps) {
  const t = useTranslations().establishment.teachersPage;
  const isInvited = teacher.status === "invited";
  const removeLabel = isInvited ? t.cancelInvitationLabel : t.removeLabel;

  return (
    <TableRow className={ROW_CLASS}>
      <TableCell className={CELL_CLASS}>
        <div className="flex min-w-0 items-center gap-[10px]">
          <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-primary-muted text-[13px] font-bold text-primary">
            {getInitials(teacher.name, { max: 2 })}
          </div>
          <div className="min-w-0">
            <p className="m-0 truncate text-[14px] font-medium text-foreground">{teacher.name}</p>
            <p className="m-0 truncate text-[12px] text-zinc-400">{teacher.email}</p>
          </div>
        </div>
      </TableCell>

      <TableCell className={cn(CELL_CLASS, "text-[14px] text-zinc-700")}>{teacher.sessionsCount}</TableCell>
      <TableCell className={cn(CELL_CLASS, "text-[14px] text-zinc-700")}>{teacher.studentsCount}</TableCell>

      <TableCell className={CELL_CLASS}>
        <TeacherStatusBadge status={teacher.status} />
      </TableCell>

      <TableCell className={CELL_CLASS}>
        <button
          type="button"
          onClick={() => onRemove(teacher)}
          title={removeLabel}
          aria-label={removeLabel}
          className="ml-auto flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[8px] border border-transparent bg-transparent text-zinc-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-[15px] w-[15px]" />
        </button>
      </TableCell>
    </TableRow>
  );
}
