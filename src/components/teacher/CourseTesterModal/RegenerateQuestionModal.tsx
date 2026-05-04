import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CircleDot, PenLine, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MAX_QUESTIONS } from "@/utils/constants/teacher";
import { Button } from "@/components/ui/button";
import { Question } from "@/types";


interface RegenerateQuestionModalProps {
    regenerateDialogOpen: boolean;
    setRegenerateDialogOpen: (open: boolean) => void;
    handleConfigChange: (field: 'single' | 'open', value: number) => void;
    executeGeneration: () => void;
    genTotalQuestions: number;
    questions: Question[];
    openGenerateCount: number;
    singleGenCount: number;
}

export function RegenerateQuestionModal({ regenerateDialogOpen, setRegenerateDialogOpen, handleConfigChange, executeGeneration, genTotalQuestions, questions, openGenerateCount, singleGenCount }: RegenerateQuestionModalProps) {
    return (
        <Dialog open={regenerateDialogOpen} onOpenChange={setRegenerateDialogOpen}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Générer des questions
                    </DialogTitle>
                    <DialogDescription>
                        Choisissez combien de questions de chaque type vous souhaitez créer.
                        {questions.length > 0 && " Les questions existantes seront remplacées."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-4">
                    <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                            <CircleDot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">Choix unique</p>
                            <p className="text-xs text-muted-foreground">L'élève choisit 1 seule réponse parmi 4</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Input
                                type="number"
                                min={0}
                                max={MAX_QUESTIONS}
                                value={singleGenCount}
                                onChange={(e) => handleConfigChange('single', parseInt(e.target.value) || 0)}
                                className="w-16 h-9 text-center"
                                data-testid="input-gen-qcm-count"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                            <PenLine className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">Réponse rédigée</p>
                            <p className="text-xs text-muted-foreground">L'élève écrit sa réponse avec ses mots</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Input
                                type="number"
                                min={0}
                                max={MAX_QUESTIONS}
                                value={openGenerateCount}
                                onChange={(e) => handleConfigChange('open', parseInt(e.target.value) || 0)}
                                className="w-16 h-9 text-center"
                                data-testid="input-gen-ouverte-count"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-2 border-t">
                        <span className="text-sm font-medium">Total de questions à générer <span className="text-muted-foreground font-normal">(max {MAX_QUESTIONS})</span></span>
                        <span className="text-xl font-bold text-primary">{genTotalQuestions}</span>
                    </div>

                    {genTotalQuestions === 0 && (
                        <p className="text-sm text-destructive text-center">Indiquez au moins 1 question à générer</p>
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setRegenerateDialogOpen(false)}>
                        Annuler
                    </Button>
                    <Button
                        onClick={executeGeneration}
                        disabled={genTotalQuestions === 0}
                        data-testid="button-confirm-generate"
                    >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Générer {genTotalQuestions} question{genTotalQuestions > 1 ? 's' : ''}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

