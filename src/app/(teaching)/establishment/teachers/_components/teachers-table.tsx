"use client";

import { useState } from "react";
import { useTranslations } from "@/lib/i18n/client";
import type { TeacherWithStats } from "@/types";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useEstablishment } from "../../_contexts/establishment-context";
import { RemoveTeacherDialog } from "./remove-teacher-dialog";
import { TeachersEmptyState } from "./teachers-empty-state";
import { TeachersTableHeader } from "./teachers-table-header";
import { TeachersTableSkeleton } from "./teachers-table-skeleton";
import { TeacherTableRow } from "./teacher-table-row";
import { TEACHERS_TABLE_COLUMNS_COUNT } from "./teachers-table.styles";

export function TeachersTable() {
  const t = useTranslations().establishment.teachersPage;
  const { teachers, loading, deleteTeacher } = useEstablishment();
  const [teacherToRemove, setTeacherToRemove] = useState<TeacherWithStats | null>(null);

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
      {loading ? (
        <Skeleton className="mb-[20px] h-[19px] w-[220px]" />
      ) : (
        <p className="mb-[20px] text-[13px] text-zinc-500">
          {t.countLabel.replace("{count}", String(teachers.length))}
        </p>
      )}

      <div className="overflow-hidden rounded-[12px] border border-border bg-background">
        <Table className="min-w-[640px] table-fixed">
          <TeachersTableHeader />

          <TableBody>
            {loading && <TeachersTableSkeleton />}

            {!loading && teachers.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={TEACHERS_TABLE_COLUMNS_COUNT} className="p-0">
                  <TeachersEmptyState />
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              teachers.map((teacher) => (
                <TeacherTableRow key={teacher.id} teacher={teacher} onRemove={setTeacherToRemove} />
              ))}
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
