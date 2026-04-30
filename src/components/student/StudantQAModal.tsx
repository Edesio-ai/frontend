import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageCircle, Send, Check, Clock, HelpCircle } from "lucide-react";
import { Course, QuestionCourse } from "@/types";

interface StudentQAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cours: Course;
  fetchQuestionsCoursForCours: (coursId: string) => Promise<QuestionCourse[]>;
  askQuestionCours: (coursId: string, questionText: string) => Promise<{ success: boolean; error?: string; question?: QuestionCourse }>;
}

export function StudentQAModal({
  open,
  onOpenChange,
  cours,
  fetchQuestionsCoursForCours,
  askQuestionCours,
}: StudentQAModalProps) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuestionCourse[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await fetchQuestionsCoursForCours(cours.id);
      setQuestions(data);
    } catch (err) {
      console.error("Error loading questions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadQuestions();
      setNewQuestion("");
      setSubmitError("");
    }
  }, [open, cours.id]);

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) {
      setSubmitError("Veuillez saisir votre question.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    
    const result = await askQuestionCours(cours.id, newQuestion.trim());
    
    if (result.success && result.question) {
      setQuestions(prev => [result.question!, ...prev]);
      setNewQuestion("");
    } else {
      setSubmitError(result.error || "Une erreur est survenue.");
    }
    
    setSubmitting(false);
  };

  const answeredQuestions = questions.filter(q => q.answer);
  const pendingQuestions = questions.filter(q => !q.answer);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <HelpCircle className="h-4 w-4 text-white" />
            </div>
            Questions & Réponses
          </DialogTitle>
          <DialogDescription>
            Posez une question au professeur ou consultez les réponses pour le cours "{cours.title}".
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <Card className="p-4 bg-primary/5 border-primary/20">
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              Poser une question
            </h4>
            <Textarea
              placeholder="Écrivez votre question ici..."
              value={newQuestion}
              onChange={(e) => {
                setNewQuestion(e.target.value);
                setSubmitError("");
              }}
              className="min-h-[80px] mb-3"
              disabled={submitting}
              data-testid="textarea-new-question"
            />
            {submitError && (
              <p className="text-sm text-destructive mb-2">{submitError}</p>
            )}
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitQuestion}
                disabled={!newQuestion.trim() || submitting}
                data-testid="button-submit-question"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Envoyer ma question
              </Button>
            </div>
          </Card>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Aucune question n'a encore été posée pour ce cours.
              </p>
              <p className="text-sm text-muted-foreground">
                Sois la première personne à poser une question !
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingQuestions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    En attente de réponse ({pendingQuestions.length})
                  </h4>
                  {pendingQuestions.map((question) => (
                    <Card 
                      key={question.id} 
                      className="p-4 border-amber-500/30 bg-amber-500/5"
                      data-testid={`pending-question-${question.id}`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs shrink-0">
                          En attente
                        </Badge>
                      </div>
                      <p className="text-sm">{question.questionText}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Posée le {new Date(question.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </Card>
                  ))}
                </div>
              )}

              {answeredQuestions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Questions répondues ({answeredQuestions.length})
                  </h4>
                  {answeredQuestions.map((question) => (
                    <Card 
                      key={question.id} 
                      className="p-4"
                      data-testid={`answered-question-${question.id}`}
                    >
                      <p className="text-sm font-medium mb-3">{question.questionText}</p>
                      <div className="pl-4 border-l-2 border-primary/30">
                        <p className="text-xs text-muted-foreground mb-1">Réponse du professeur :</p>
                        <p className="text-sm">{question.answer}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Répondu le {new Date(question.answeredAt!).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t px-6 py-4 flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}