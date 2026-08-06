"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Loader2, Save, Pencil } from "lucide-react";
import { Course } from "@/types";
import { useTranslations } from "@/lib/i18n/client";

type EditQuestionTesterModalSectionProps = {
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  handleSave: () => void;
  isSaving: boolean;
  course: Course;
  editedTitle: string;
  setEditedTitle: (editedTitle: string) => void;
  editedDescription: string;
  setEditedDescription: (editedDescription: string) => void;
  editedContent: string;
  setEditedContent: (editedContent: string) => void;
};

export function EditQuestionTesterModalSection({
  isEditing,
  setIsEditing,
  handleSave,
  isSaving,
  course,
  editedTitle,
  setEditedTitle,
  editedDescription,
  setEditedDescription,
  editedContent,
  setEditedContent,
}: EditQuestionTesterModalSectionProps) {
  const t = useTranslations();
  return (
    <>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h4 className="font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {t.dashboard.courseTester.courseContent}
        </h4>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                {t.teacher.editQuestion.cancel}
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" /> {t.teacher.editQuestion.save}
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-1" /> {t.dashboard.courseTester.edit}
            </Button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">{t.dashboard.courseTester.fieldTitle}</label>
            <Input value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t.dashboard.courseTester.fieldDescription}</label>
            <Input
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              placeholder={t.dashboard.courseTester.fieldDescription}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t.dashboard.courseTester.fieldTextContent}</label>
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[120px]"
              placeholder={t.dashboard.courseTester.fieldContent}
            />
          </div>
        </div>
      ) : (
        <Card className="p-4 space-y-3">
          <div>
            <span className="text-xs text-muted-foreground uppercase">{t.dashboard.courseTester.fieldTitle}</span>
            <p className="font-medium">{course.title}</p>
          </div>
          {course.description && (
            <div>
              <span className="text-xs text-muted-foreground uppercase">
                {t.dashboard.courseTester.fieldDescription}
              </span>
              <p className="text-sm">{course.description}</p>
            </div>
          )}
          {course.contentText && (
            <div>
              <span className="text-xs text-muted-foreground uppercase">{t.dashboard.courseTester.fieldContent}</span>
              <p className="text-sm whitespace-pre-wrap line-clamp-4">{course.contentText}</p>
            </div>
          )}
        </Card>
      )}
    </>
  );
}
