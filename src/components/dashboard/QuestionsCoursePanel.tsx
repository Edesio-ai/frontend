import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageCircle, Send, Check, Clock, Trash2 } from "lucide-react";
import type { Course, CourseQuestion } from "@/types";
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

interface QuestionsCoursWithCourse extends CourseQuestion {
  courseTitle?: string;
}

interface QuestionsCoursPanelProps {
  sessionId: string;
  fetchCourses: (sessionId: string) => Promise<Course[]>;
  fetchQuestionsCoursForCours: (coursId: string) => Promise<CourseQuestion[]>;
  answerQuestionCours: (questionId: string, reponse: string) => Promise<CourseQuestion | null>;
  deleteQuestionCours: (questionId: string) => Promise<boolean>;
  onPendingCountChange?: () => void;
}

export function QuestionsCoursePanel({
  sessionId,
  fetchCourses,
  fetchQuestionsCoursForCours,
  answerQuestionCours,
  deleteQuestionCours,
  onPendingCountChange,
}: QuestionsCoursPanelProps) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuestionsCoursWithCourse[]>([]);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const courses = await fetchCourses(sessionId);
      const allQuestions: QuestionsCoursWithCourse[] = [];
      
      for (const cours of courses) {
        const courseQuestions = await fetchQuestionsCoursForCours(cours.id);
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
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
      
      setQuestions(allQuestions);
    } catch (err) {
      console.error("Error loading questions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadQuestions();
      onPendingCountChange?.();
    };
    init();
  }, [sessionId]);

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
    const result = await answerQuestionCours(answeringId, answerText.trim());
    setSubmitting(false);
    
    if (result) {
      setQuestions(prev => prev.map(q => 
        q.id === answeringId 
          ? { ...q, answer: result.answer, answeredAt: result.answeredAt }
          : q
      ));
      setAnsweringId(null);
      setAnswerText("");
      onPendingCountChange?.();
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    
    const questionToDelete = questions.find(q => q.id === deleteConfirmId);
    const wasUnanswered = questionToDelete && !questionToDelete.answer;
    
    setDeleting(true);
    const success = await deleteQuestionCours(deleteConfirmId);
    setDeleting(false);
    
    if (success) {
      setQuestions(prev => prev.filter(q => q.id !== deleteConfirmId));
      if (wasUnanswered) {
        onPendingCountChange?.();
      }
    }
    setDeleteConfirmId(null);
  };

  const pendingCount = questions.filter(q => !q.answer).length;
  const answeredCount = questions.filter(q => q.answer).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Aucune question</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Les élèves n'ont pas encore posé de questions sur les cours de cette session.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1.5">
            <Clock className="h-3 w-3" />
            {pendingCount} en attente
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <Check className="h-3 w-3" />
            {answeredCount} répondues
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {questions.map((question) => (
          <Card 
            key={question.id} 
            className={`p-4 ${!question.answer ? "border-amber-500/30 bg-amber-500/5" : ""}`}
            data-testid={`question-cours-${question.id}`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="outline" className="text-xs">
                      {question.courseTitle}
                    </Badge>
                    {!question.answer && (
                      <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs">
                        En attente
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium" data-testid={`question-text-${question.id}`}>
                    {question.question}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Par <span className="font-medium">{question.studentName || "Élève"}</span> le {new Date(question.createdAt).toLocaleDateString("fr-FR")} à {new Date(question.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteConfirmId(question.id)}
                  data-testid={`button-delete-question-${question.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {question.answer ? (
                <div className="pl-4 border-l-2 border-primary/30">
                  <p className="text-sm text-muted-foreground mb-1">Votre réponse :</p>
                  <p className="text-sm">{question.answer}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Répondu le {new Date(question.answeredAt!).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              ) : answeringId === question.id ? (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Écrivez votre réponse..."
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    className="min-h-[80px]"
                    data-testid={`textarea-answer-${question.id}`}
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelAnswer}
                      disabled={submitting}
                    >
                      Annuler
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmitAnswer}
                      disabled={!answerText.trim() || submitting}
                      data-testid={`button-submit-answer-${question.id}`}
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Envoyer
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleStartAnswer(question.id)}
                  data-testid={`button-answer-${question.id}`}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Répondre
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette question ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La question et sa réponse éventuelle seront définitivement supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
