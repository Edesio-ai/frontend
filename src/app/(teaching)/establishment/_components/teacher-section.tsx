"use client";

import { GraduationCap } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useEstablishment } from "../_contexts/establishment-context";
import { useTranslations } from "@/lib/i18n/client";
import { TeacherTable } from "./teacher-table";

export function TeacherSection() {
  const { teachers, stats } = useEstablishment();
  const t = useTranslations();

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
        <GraduationCap className="h-5 w-5" />
        {t.establishment.teachers} ({stats.totalTeachers})
      </h2>

      {teachers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>{t.establishment.noTeachers}</p>
          <p className="text-sm mt-1">{t.establishment.inviteTeachersHint}</p>
        </div>
      ) : (
        <TeacherTable teachers={teachers} />
      )}
    </Card>
  );
}
