"use client";

import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslations } from "@/lib/i18n/client";

type RemoveTeacherDialogProps = {
  teacherName: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function RemoveTeacherDialog({ teacherName, onOpenChange, onConfirm }: RemoveTeacherDialogProps) {
  const t = useTranslations().establishment.teachersPage.removeDialog;

  return (
    <AlertDialog open={teacherName !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[400px] gap-0 rounded-[14px] border-border p-[24px] shadow-[0_20px_44px_-18px_rgba(24,24,27,0.25)]">
        <div className="mb-[14px] flex items-center gap-[12px]">
          <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[10px] border border-red-200 bg-red-100">
            <Trash2 className="h-[18px] w-[18px] text-red-600" />
          </div>
          <AlertDialogTitle className="m-0 text-[16px] font-bold">
            {t.title.replace("{name}", teacherName ?? "")}
          </AlertDialogTitle>
        </div>

        <AlertDialogDescription className="mb-[22px] text-[13.5px] leading-[1.6] text-zinc-600">
          {t.description}
        </AlertDialogDescription>

        <div className="flex justify-end gap-[10px]">
          <AlertDialogCancel className="mt-0 h-auto rounded-[8px] border-border px-[16px] py-[10px] text-[13.5px] font-semibold">
            {t.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="h-auto rounded-[8px] bg-red-600 px-[16px] py-[10px] text-[13.5px] font-semibold text-white hover:bg-red-700"
          >
            {t.confirm}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
