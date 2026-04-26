import { Question } from "@/types";
import { Card } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { CheckCircle2, Loader2, Save, Trash2 } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { DeleteQuestionModal } from "./DeleteQuestionModal";

type EditQuestionModalProps = {
    question: Question;
    index: number;
    editedType: "single" | "multiple" | "open";
    editedProposals: string[];
    setEditedPropositions: (propositions: string[]) => void;
    handleTypeChange: (newType: "single" | "open") => void;
    setDeleteConfirmOpen: (open: boolean) => void;
    isSaving: boolean;
    handleCancel: () => void;
    handleSave: () => void;
    editedQuestion: string;
    setEditedQuestion: (question: string) => void;
    correctAnswerIndex: number;
    setCorrectAnswerIndex: (index: number) => void;
    editedGoodAnswer: string;
    setEditedGoodAnswer: (bonneReponse: string) => void;
    editedExplanation: string;
    setEditedExplication: (explication: string) => void;
    deleteConfirmOpen: boolean;
    isDeleting: boolean;
    handleDelete: () => void;
}

export function EditQuestionModal({ 
    question,
    index,
    editedType,
    editedProposals,
    setEditedPropositions,
    handleTypeChange,
    setDeleteConfirmOpen,
    isSaving,
    handleCancel,
    handleSave,
    editedQuestion,
    setEditedQuestion,
    correctAnswerIndex,
    setCorrectAnswerIndex,
    editedGoodAnswer,
    setEditedGoodAnswer,
    editedExplanation,
    setEditedExplication,
    deleteConfirmOpen,
    isDeleting,
    handleDelete,
}: EditQuestionModalProps) {


    return (
        <>
            <Card className="p-3 bg-muted/30 border-primary/20" data-testid={`card-question-edit-${question.id}`}>
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                {index + 1}
                            </div>
                            <Select  value={editedType} onValueChange={(v) => handleTypeChange(v as "single" | "open")}>
                                <SelectTrigger className="h-7 w-28 text-xs" data-testid={`select-type-${question.id}`}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="single">QCM</SelectItem>
                                    <SelectItem value="open">Ouverte</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-1">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setDeleteConfirmOpen(true)}
                                disabled={isSaving}
                                data-testid={`button-delete-question-${question.id}`}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleCancel} disabled={isSaving}>
                                Annuler
                            </Button>
                            <Button size="sm" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                            </Button>
                        </div>
                    </div>

                    <Textarea
                        value={editedQuestion}
                        onChange={(e) => setEditedQuestion(e.target.value)}
                        className="min-h-[60px] text-sm"
                        placeholder="Texte de la question..."
                        data-testid={`input-question-text-${question.id}`}
                    />

                    {editedType === "single" && (
                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Propositions (cliquez sur le bouton pour marquer la bonne réponse)</label>
                            {editedProposals.map((prop, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <span className="font-medium text-xs w-4">{String.fromCharCode(65 + i)}.</span>
                                    <Input
                                        value={prop}
                                        onChange={(e) => {
                                            const newProps = [...editedProposals];
                                            newProps[i] = e.target.value;
                                            setEditedPropositions(newProps);
                                        }}
                                        className={`text-sm ${correctAnswerIndex === i ? "border-green-500" : ""}`}
                                        data-testid={`input-proposition-${question.id}-${i}`}
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant={correctAnswerIndex === i ? "default" : "outline"}
                                        onClick={() => setCorrectAnswerIndex(i)}
                                        className="h-8 w-8 p-0"
                                        data-testid={`button-correct-${question.id}-${i}`}
                                    >
                                        {correctAnswerIndex === i ? <CheckCircle2 className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3 opacity-30" />}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {editedType === "open" && (
                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Réponse attendue</label>
                            <Textarea
                                value={editedGoodAnswer}
                                onChange={(e) => setEditedGoodAnswer(e.target.value)}
                                placeholder="Réponse attendue..."
                                className="min-h-[40px] text-sm"
                                data-testid={`input-answer-${question.id}`}
                            />
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Explication (optionnelle)</label>
                        <Textarea
                            value={editedExplanation}
                            onChange={(e) => setEditedExplication(e.target.value)}
                            placeholder="Explication de la réponse..."
                            className="min-h-[40px] text-sm"
                            data-testid={`input-explanation-${question.id}`}
                        />
                    </div>
                </div>
            </Card>

            <DeleteQuestionModal deleteConfirmOpen={deleteConfirmOpen} setDeleteConfirmOpen={setDeleteConfirmOpen} isDeleting={isDeleting} handleDelete={handleDelete} />
        </>
    )
}