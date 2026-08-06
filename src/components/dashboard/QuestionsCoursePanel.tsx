"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageCircle, Send, Check, Clock, Trash2 } from "lucide-react";
import type { CourseQuestion } from "@/types";
import { useTranslations, useLocale } from "@/lib/i18n/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTeacher } from "@/app/(teaching)/teacher/_contexts/teacher-context";
import { cn } from "@/lib/utils";

interface QuestionsCoursWithCourse extends CourseQuestion {
  courseTitle?: string;
}

interface QuestionsCoursPanelProps {
  sessionId: string;
  onPendingCountChange?: () => void;
}

type FilterTab = "pending" | "answered";

export function QuestionsCoursePanel({ sessionId, onPendingCountChange }: QuestionsCoursPanelProps) {
  const t = useTranslations();
  const locale = useLocale();
  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuestionsCoursWithCourse[]>([]);
  const [filter, setFilter] = useState<FilterTab>("pending");
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { fetchCourses, fetchQuestionsCourseForCourse, answerCourseQuestion, deleteCourseQuestion } = useTeacher();

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const courses = await fetchCourses(sessionId);
      const allQuestions: QuestionsCoursWithCourse[] = [];

      for (const cours of courses) {
        const courseQuestions = await fetchQuestionsCourseForCourse(cours.id);
        for (const q of courseQuestions) {
          allQuestions.push({
            ...q,
            courseTitle: cours.title,
          });
        }
      }

      allQuestions.sort((a, b) => {
        if (!a.answer && b.answer) return -1;
        if (a.answer && !b.answer) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setQuestions(allQuestions);
    } catch (err) {
      console.error("Error loading questions:", err);
    } finally {
      setLoading(false);
    }
  }, [sessionId, fetchCourses, fetchQuestionsCourseForCourse]);

  useEffect(() => {
    void loadQuestions();
  }, [sessionId, loadQuestions]);

  const pendingQuestions = useMemo(() => questions.filter((q) => !q.answer), [questions]);
  const answeredQuestions = useMemo(() => questions.filter((q) => q.answer), [questions]);
  const visibleQuestions = filter === "pending" ? pendingQuestions : answeredQuestions;

  useEffect(() => {
    if (filter === "pending" && pendingQuestions.length === 0 && answeredQuestions.length > 0) {
      setFilter("answered");
    }
  }, [filter, pendingQuestions.length, answeredQuestions.length]);

  const handleStartAnswer = (questionId: string) => {
    setAnsweringId(questionId);
    setAnswerText("");
  };

  const handleCancelAnswer = () => {
    setAnsweringId(null);
    setAnswerText("");
  };

  const handleSubmitAnswer = async () => {
    if (!answeringId || !answerText.trim()) return;

    setSubmitting(true);
    const result = await answerCourseQuestion(answeringId, answerText.trim());
    setSubmitting(false);

    if (result) {
      setQuestions((prev) =>
        prev.map((q) => (q.id === answeringId ? { ...q, answer: result.answer, answeredAt: result.answeredAt } : q)),
      );
      setAnsweringId(null);
      setAnswerText("");
      onPendingCountChange?.();
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;

    const questionToDelete = questions.find((q) => q.id === deleteConfirmId);
    const wasUnanswered = questionToDelete && !questionToDelete.answer;

    setDeleting(true);
    const success = await deleteCourseQuestion(deleteConfirmId);
    setDeleting(false);

    if (success) {
      setQuestions((prev) => prev.filter((q) => q.id !== deleteConfirmId));
      if (wasUnanswered) {
        onPendingCountChange?.();
      }
    }
    setDeleteConfirmId(null);
  };

  const formatAskedBy = (question: QuestionsCoursWithCourse) =>
    t.dashboard.questionsPanel.askedBy
      .replace("{name}", question.studentName || t.dashboard.questionsPanel.studentFallback)
      .replace("{date}", new Date(question.createdAt).toLocaleDateString(dateLocale))
      .replace(
        "{time}",
        new Date(question.createdAt).toLocaleTimeString(dateLocale, {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="text-base font-medium">{t.dashboard.questionsPanel.noQuestions}</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{t.dashboard.questionsPanel.noQuestionsHint}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border bg-muted/40 p-1">
        <button
          type="button"
          onClick={() => setFilter("pending")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
            filter === "pending"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Clock className="h-3.5 w-3.5" />
          {t.student.qaModal.pending.replace("{count}", String(pendingQuestions.length))}
        </button>
        <button
          type="button"
          onClick={() => setFilter("answered")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
            filter === "answered"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Check className="h-3.5 w-3.5" />
          {t.dashboard.questionsPanel.answeredCount.replace("{count}", String(answeredQuestions.length))}
        </button>
      </div>

      {visibleQuestions.length === 0 ? (
        <div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          {filter === "pending"
            ? t.dashboard.questionsPanel.noPendingQuestions
            : t.dashboard.questionsPanel.noAnsweredQuestions}
        </div>
      ) : (
        <ul className="space-y-2">
          {visibleQuestions.map((question) => {
            const isPending = !question.answer;
            const isAnswering = answeringId === question.id;

            return (
              <li
                key={question.id}
                className={cn(
                  "rounded-xl border bg-background",
                  isPending ? "border-l-4 border-l-amber-500" : "border-l-4 border-l-emerald-500/70",
                )}
                data-testid={`question-cours-${question.id}`}
              >
                <div className="flex items-start gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {question.courseTitle ? (
                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {question.courseTitle}
                        </span>
                      ) : null}
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-xs font-medium",
                          isPending
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                            : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
                        )}
                      >
                        {isPending ? t.dashboard.questionsPanel.pendingLabel : t.dashboard.questionsPanel.answeredLabel}
                      </span>
                    </div>

                    <p className="text-sm leading-snug" data-testid={`question-text-${question.id}`}>
                      {question.questionText}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatAskedBy(question)}</p>

                    {question.answer ? (
                      <div className="rounded-lg bg-muted/50 px-3 py-2.5">
                        <p className="mb-1 text-xs font-medium text-muted-foreground">
                          {t.dashboard.questionsPanel.yourAnswer}
                        </p>
                        <p className="text-sm leading-relaxed">{question.answer}</p>
                        {question.answeredAt ? (
                          <p className="mt-1.5 text-xs text-muted-foreground">
                            {t.dashboard.questionsPanel.answeredOn.replace(
                              "{date}",
                              new Date(question.answeredAt).toLocaleDateString(dateLocale),
                            )}
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    {isAnswering ? (
                      <div className="space-y-2 pt-1">
                        <Textarea
                          placeholder={t.dashboard.questionsPanel.answerPlaceholder}
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          className="min-h-[88px] resize-y"
                          autoFocus
                          data-testid={`textarea-answer-${question.id}`}
                        />
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={handleCancelAnswer} disabled={submitting}>
                            {t.common.cancel}
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSubmitAnswer}
                            disabled={!answerText.trim() || submitting}
                            data-testid={`button-submit-answer-${question.id}`}
                          >
                            {submitting ? (
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Send className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            {t.dashboard.questionsPanel.answer}
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {isPending && !isAnswering ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8"
                        onClick={() => handleStartAnswer(question.id)}
                        data-testid={`button-answer-${question.id}`}
                      >
                        <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                        {t.dashboard.questionsPanel.answer}
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteConfirmId(question.id)}
                      data-testid={`button-delete-question-${question.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.dashboard.questionsPanel.deleteQuestion}</AlertDialogTitle>
            <AlertDialogDescription>{t.dashboard.questionsPanel.deleteIrreversible}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t.teacher.deleteQuestionModal.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
