"use client";

import { Course } from "@/types";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Loader2, Plus, Sparkles, Upload, X } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "@/lib/i18n/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type FormValues = {
  title: string;
  description: string;
  contentText: string;
};

export function AddCourseModal({
  open,
  onOpenChange,
  sessionId,
  createCourse,
  onCourseCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  createCourse: (
    sessionId: string,
    title: string,
    description: string,
    contentText: string,
    pdfFiles?: File[],
  ) => Promise<Course | null>;
  onCourseCreated: (cours: Course) => void;
}) {
  const t = useTranslations();
  const ac = t.teacher.addCourse;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPdfFiles, setSelectedPdfFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formSchema = useMemo(
    () =>
      z.object({
        title: z.string().min(1, ac.titleRequired).max(200, ac.titleTooLong),
        description: z.string().max(500, ac.descriptionTooLong),
        contentText: z.string(),
      }),
    [ac],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      contentText: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const newCoursee = await createCourse(
      sessionId,
      data.title,
      data.description || "",
      data.contentText || "",
      selectedPdfFiles.length > 0 ? selectedPdfFiles : undefined,
    );
    if (newCoursee) {
      onCourseCreated(newCoursee);
      form.reset();
      setSelectedPdfFiles([]);
      onOpenChange(false);
    }
    setIsSubmitting(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedPdfFiles((prev) => [...prev, ...Array.from(files)]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedPdfFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setSelectedPdfFiles([]);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col p-0"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Plus className="h-4 w-4 text-primary-foreground" />
            </div>
            {ac.title}
          </DialogTitle>
          <DialogDescription>{ac.subtitle}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{ac.name}</FormLabel>
                      <FormControl>
                        <Input placeholder={ac.namePlaceholder} {...field} data-testid="input-course-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{ac.description}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={ac.descriptionPlaceholder}
                          {...field}
                          data-testid="input-course-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>{ac.pdfs}</FormLabel>
                  <p className="text-xs text-muted-foreground">{ac.pdfHint}</p>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    ref={fileInputRef}
                    multiple
                    data-testid="input-course-pdf"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-input bg-muted/30 px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/50"
                    data-testid="button-select-pdf"
                  >
                    <Upload className="h-5 w-5" />
                    <span>{selectedPdfFiles.length > 0 ? ac.addMorePdfs : ac.selectPdfs}</span>
                  </button>
                  {selectedPdfFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedPdfFiles.map((file, index) => (
                        <div
                          key={`${file.name}-${file.size}-${index}`}
                          className="flex items-center gap-2 text-sm bg-primary/10 border border-primary/20 rounded-md px-2 py-1"
                        >
                          <FileText className="h-3.5 w-3.5 text-primary" />
                          <span className="max-w-[200px] truncate">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => removeSelectedFile(index)}
                            data-testid={`button-remove-pdf-${index}`}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="contentText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{ac.content}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={ac.contentPlaceholder}
                          className="min-h-[100px] resize-y"
                          {...field}
                          data-testid="textarea-course-content"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 border-t flex-shrink-0 bg-background">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                {t.common.cancel}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="shadow-lg shadow-primary/25"
                data-testid="button-add-course"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {ac.creating}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {ac.create}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
