import { DndContext, closestCenter, DragEndEvent, SensorDescriptor, SensorOptions } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy  } from "@dnd-kit/sortable";
import { ListChecks, MessageSquare, Plus, Sparkles, Loader2, HelpCircle, Download } from "lucide-react";
import { Question } from "@/types";
import { UpdateQuestionRequest } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SortableQuestionItem } from "@/components/teacher/SotableQuestionItem";

type QuestionSectionTesterModalProps = {
  questions: Question[];
  handleGenerateQuestions: () => void;
  isGenerating: boolean;
  generateError: string | null;
  generateSuccess: string | null;
  setChatbotModalOpen: (open: boolean) => void;
  setAddQuestionOpen: (open: boolean) => void;
  currentQcmCount: number;
  currentOuverteCount: number;
  handleQuestionDragEnd: (event: DragEndEvent) => void;
  handleQuestionUpdated: (question: Question) => void;
  handleQuestionDeleted: (questionId: string) => void;
  updateQuestion: (questionId: string, updates: UpdateQuestionRequest) => Promise<Question | null>;
  deleteQuestion: (questionId: string) => Promise<boolean>;
  handleDownloadQuestionsPdf: (e: React.MouseEvent<HTMLButtonElement>) => void;
  questionSensors: SensorDescriptor<SensorOptions>[] | undefined;
}

export function QuestionSectionTesterModal({ questions, handleGenerateQuestions, isGenerating, generateError, generateSuccess, setChatbotModalOpen, setAddQuestionOpen, currentQcmCount, currentOuverteCount, handleQuestionDragEnd, handleQuestionUpdated, handleQuestionDeleted, updateQuestion, deleteQuestion, handleDownloadQuestionsPdf, questionSensors }: QuestionSectionTesterModalProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h5 className="font-medium text-sm flex items-center gap-2">
          <ListChecks className="h-4 w-4" />
          Questions ({questions.length})
        </h5>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setChatbotModalOpen(true)} data-testid="button-test-chatbot">
            <MessageSquare className="h-4 w-4 mr-1" />
            Tester le chatbot
          </Button>
          <Button size="sm" onClick={handleGenerateQuestions} disabled={isGenerating}>
            {isGenerating ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Génération...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-1" /> {questions.length > 0 ? "Re-générer" : "Générer des questions"}</>
            )}
          </Button>
        </div>
      </div>

      {generateError && (
        <Card className="p-3 bg-destructive/10 border-destructive/20 text-destructive text-sm">
          {generateError}
        </Card>
      )}
      {generateSuccess && (
        <Card className="p-3 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm">
          {generateSuccess}
        </Card>
      )}

      {questions.length > 0 ? (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="questions" className="border rounded-lg">
            <div className="flex items-center justify-between px-4 py-3">
              <AccordionTrigger className="hover:no-underline p-0 flex-1 [&>svg]:ml-auto">
                <div className="flex items-center gap-2 text-sm">
                  <HelpCircle className="h-4 w-4" />
                  <span>Voir les {questions.length} questions</span>
                  <span className="text-muted-foreground text-xs">
                    ({currentQcmCount} QCM, {currentOuverteCount} ouvertes)
                  </span>
                </div>
              </AccordionTrigger>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handleDownloadQuestionsPdf(e)}
                data-testid="button-export-questions-pdf-phase2"
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                PDF
              </Button>
            </div>
            <AccordionContent>
              <DndContext
                sensors={questionSensors}
                collisionDetection={closestCenter}
                onDragEnd={handleQuestionDragEnd}
              >
                <SortableContext
                  items={questions.map((q) => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2 px-4 pb-4 max-h-[500px] overflow-y-auto">
                    {questions.map((q, index) => (
                      <SortableQuestionItem
                        key={q.id}
                        question={q}
                        index={index}
                        updateQuestion={updateQuestion}
                        deleteQuestion={deleteQuestion}
                        onQuestionUpdated={handleQuestionUpdated}
                        onQuestionDeleted={handleQuestionDeleted}
                      />
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => setAddQuestionOpen(true)}
                      data-testid="button-add-question"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter une question
                    </Button>
                  </div>
                </SortableContext>
              </DndContext>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : (
        <div className="text-sm text-muted-foreground text-center py-4 bg-muted/20 rounded-md space-y-3">
          <Sparkles className="h-6 w-6 mx-auto opacity-50" />
          <p>Aucune question générée.</p>
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddQuestionOpen(true)}
              data-testid="button-add-question-empty"
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter manuellement
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}