import { BookOpen, FileText, HelpCircle, Loader2, Users } from "lucide-react";
import { Button } from "../ui/button";
import { DialogFooter, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Accordion } from "@radix-ui/react-accordion";
import { CourseDetails } from "@/types";
import {
  propositionLabels,
  correctAnswerDisplay,
} from "@/lib/proposition-labels";
import { Dialog } from "@radix-ui/react-dialog";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Badge } from "../ui/badge";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { AvatarFallback } from "../ui/avatar";

export function CourseViewModal({
    isOpen,
    onClose,
    courseDetails,
    loading,
  }: {
    isOpen: boolean;
    onClose: () => void;
    courseDetails: CourseDetails | null;
    loading: boolean;
  }) {
    if (!isOpen) return null;
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {courseDetails?.course.title || "Cours"}
            </DialogTitle>
            {courseDetails?.course.description && (
              <DialogDescription>
                {courseDetails.course.description}
              </DialogDescription>
            )}
          </DialogHeader>
  
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : courseDetails ? (
            <div className="flex-1 overflow-y-auto space-y-6 py-4">
              {courseDetails.course.contentText && (
                <div className="space-y-2">
                  <h3 className="font-medium text-sm flex flex-wrap items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Contenu texte
                  </h3>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg whitespace-pre-wrap">
                    {courseDetails.course.contentText}
                  </p>
                </div>
              )}
  
              {courseDetails.files.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-sm flex flex-wrap items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Fichiers PDF ({courseDetails.files.length})
                  </h3>
                  <div className="space-y-1">
                    {courseDetails.files.map((f) => (
                      <div key={f.id} className="flex items-center gap-2 p-2 rounded bg-muted/30 text-sm">
                        <FileText className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{f.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
  
              <div className="space-y-2">
                <h3 className="font-medium text-sm flex flex-wrap items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Questions ({courseDetails.questions.length})
                </h3>
                {courseDetails.questions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune question créée.</p>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {courseDetails.questions.map((q, index) => (
                      <AccordionItem key={q.id} value={q.id}>
                        <AccordionTrigger className="text-sm text-left">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={q.type === "single" || q.type === "multiple" ? "default" : "outline"} className="text-xs">
                              {q.type === "single" || q.type === "multiple" ? "QCM" : "Ouverte"}
                            </Badge>
                            <span>Q{index + 1}: {q.question.length > 80 ? q.question.substring(0, 80) + "..." : q.question}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pl-4">
                            <p className="text-sm"><strong>Question:</strong> {q.question}</p>
                            {(q.type === "single" || q.type === "multiple") &&
                              propositionLabels(q.propositions).length > 0 && (
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Propositions :</p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground">
                                  {propositionLabels(q.propositions).map((opt, i) => (
                                    <li
                                      key={i}
                                      className={
                                        opt ===
                                        correctAnswerDisplay(q.propositions, q.correctAnswers || [])
                                          ? "text-green-600 font-medium"
                                          : ""
                                      }
                                    >
                                      {opt}{" "}
                                      {opt ===
                                        correctAnswerDisplay(q.propositions, q.correctAnswers || []) &&
                                        "(Correcte)"}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <p className="text-sm">
                              <strong>Réponse correcte :</strong>{" "}
                              <span className="text-green-600">
                                {q.correctAnswers?.length
                                  ? q.correctAnswers
                                      .map((c) =>
                                        correctAnswerDisplay(q.propositions, q.correctAnswers || []),
                                      )
                                      .join(", ")
                                  : correctAnswerDisplay(
                                      q.propositions,
                                      q.correctAnswers || [],
                                    )}
                              </span>
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
  
              <div className="space-y-2">
                <h3 className="font-medium text-sm flex flex-wrap items-center gap-2">
                  <Users className="h-4 w-4" />
                  Élèves ayant travaillé sur ce cours ({courseDetails.students.length})
                </h3>
                {courseDetails.students.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun élève n'a encore travaillé sur ce cours.</p>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {courseDetails.students.map((student) => (
                      <div key={student.id} className="flex flex-wrap items-center justify-between gap-2 p-2 rounded bg-muted/30 text-sm">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={student.photoUrl || undefined} />
                            <AvatarFallback className="text-xs">
                              {student.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{student.name}</span>
                        </div>
                        <Badge variant="outline">
                          {student.correctAnswers}/{student.totalAnswers} réponses correctes
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Impossible de charger les détails du cours.
            </div>
          )}
  
          <DialogFooter>
            <Button variant="outline" onClick={onClose} data-testid="button-close-course-modal">
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }