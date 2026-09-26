"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "@/lib/i18n/client";
import type { EstablishmentTeacherListItem } from "@/types";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useEstablishment } from "../../_contexts/establishment-context";
import { buildTeacherListItems } from "../_utils/teacher-list";
import { RemoveTeacherDialog } from "./remove-teacher-dialog";
import { TeachersEmptyState } from "./teachers-empty-state";
import { TeachersTableHeader } from "./teachers-table-header";
import { TeachersTableSkeleton } from "./teachers-table-skeleton";
import { TeacherTableRow } from "./teacher-table-row";
import { TEACHERS_TABLE_COLUMNS_COUNT } from "./teachers-table.styles";

export function TeachersTable() {
  const t = useTranslations().establishment.teachersPage;
  const { teachers, invitationTokens, invitationTokensLoading, loading, deleteTeacher, deleteInvitationToken } =
    useEstablishment();
  const [teacherToRemove, setTeacherToRemove] = useState<EstablishmentTeacherListItem | null>(null);
  const isLoading = loading || invitationTokensLoading;
  const rows = useMemo(() => buildTeacherListItems(teachers, invitationTokens), [teachers, invitationTokens]);

  const handleCancelInvitation = async (item: EstablishmentTeacherListItem) => {
    try {
      await deleteInvitationToken(item.id);
      toast({
        title: t.cancelInvitationSuccessTitle,
        description: t.cancelInvitationSuccess.replace("{name}", item.name),
      });
    } catch {
      toast({
        title: t.cancelInvitationErrorTitle.replace("{name}", item.name),
        description: t.cancelInvitationError,
        variant: "destructive",
      });
    }
  };

  const handleRemove = (item: EstablishmentTeacherListItem) => {
    if (item.source === "invitation") {
      void handleCancelInvitation(item);
      return;
    }

    setTeacherToRemove(item);
  };

  const handleRemoveTeacher = async () => {
    if (!teacherToRemove) return;

    const success = await deleteTeacher(teacherToRemove.id);
    if (!success) {
      toast({
        title: t.removeDialog.errorTitle.replace("{name}", teacherToRemove.name),
        description: t.removeDialog.error,
        variant: "destructive",
      });

      return;
    }

    toast({
      title: t.removeDialog.successTitle,
      description: t.removeDialog.success.replace("{name}", teacherToRemove.name),
    });
    setTeacherToRemove(null);
  };

  return (
    <section>
      {isLoading ? (
        <Skeleton className="mb-[20px] h-[19px] w-[220px]" />
      ) : (
        <p className="mb-[20px] text-[13px] text-zinc-500">{t.countLabel.replace("{count}", String(rows.length))}</p>
      )}

      <div className="overflow-hidden rounded-[12px] border border-border bg-background">
        <Table className="min-w-[640px] table-fixed">
          <TeachersTableHeader />

          <TableBody>
            {isLoading && <TeachersTableSkeleton />}

            {!isLoading && rows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={TEACHERS_TABLE_COLUMNS_COUNT} className="p-0">
                  <TeachersEmptyState />
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              rows.map((teacher) => <TeacherTableRow key={teacher.id} teacher={teacher} onRemove={handleRemove} />)}
          </TableBody>
        </Table>
      </div>

      <RemoveTeacherDialog
        teacherName={teacherToRemove?.name ?? null}
        onOpenChange={(open) => !open && setTeacherToRemove(null)}
        onConfirm={handleRemoveTeacher}
      />
    </section>
  );
}
