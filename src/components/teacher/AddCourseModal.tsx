"use client";

import { Course } from "@/types";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "../ui/dialog";
import { FileText, Loader2, Plus, Upload, X } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { useTranslations } from "@/lib/i18n/client";


const formSchema = z.object({
    title: z.string().min(1, "Le title est requis").max(200, "Le title est trop long"),
    description: z.string().max(500, "La description est trop longue").optional().or(z.literal("")),
    contentText: z.string().optional().or(z.literal("")),
  });
  
type FormValues = z.infer<typeof formSchema>;

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
        pdfFiles?: File[]
      ) => Promise<Course | null>;
    onCourseCreated: (cours: Course) => void;
  }) {
    const t = useTranslations();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedPdfFiles, setSelectedPdfFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
  
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
        selectedPdfFiles.length > 0 ? selectedPdfFiles : undefined as File[] | undefined
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {t.teacher.addCourse.title}
            </DialogTitle>
            <DialogDescription>
              {t.teacher.addCourse.descriptionPlaceholder}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
              <ScrollArea className="flex-1 pr-4 max-h-[60vh]">
                <div className="space-y-4 pb-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.teacher.addCourse.name}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t.teacher.addCourse.namePlaceholder}
                            {...field}
                            data-testid="input-course-title"
                          />
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
                        <FormLabel>{t.teacher.addCourse.description}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t.teacher.addCourse.descriptionPlaceholder}
                            {...field}
                            data-testid="input-course-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
  
                  <div className="space-y-2">
                    <FormLabel>{t.teacher.addCourse.pdfs}</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      {t.teacher.addCourse.pdfHint}
                    </p>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                        ref={fileInputRef}
                        multiple
                        data-testid="input-course-pdf"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        data-testid="button-select-pdf"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {selectedPdfFiles.length > 0
                          ? t.teacher.addCourse.addMorePdfs
                          : t.teacher.addCourse.selectPdfs}
                      </Button>
                      {selectedPdfFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedPdfFiles.map((file, index) => (
                            <div
                              key={`${file.name}-${file.size}-${index}`}
                              className="flex items-center gap-2 text-sm bg-muted/50 rounded-md px-2 py-1"
                            >
                              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
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
                  </div>
  
                  <FormField
                    control={form.control}
                    name="contentText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t.teacher.addCourse.content}
                          <span className="text-muted-foreground font-normal ml-2">(optionnel)</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t.teacher.addCourse.contentPlaceholder}
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
              </ScrollArea>
  
              <div className="flex justify-end gap-2 pt-4 border-t mt-4 flex-shrink-0">
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  {t.common.cancel}
                </Button>
                <Button type="submit" disabled={isSubmitting} data-testid="button-add-course">
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      {t.teacher.addCourse.create}
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
