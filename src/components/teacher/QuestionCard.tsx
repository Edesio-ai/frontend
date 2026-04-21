import { correctAnswerDisplay, indexMatchesCorrectAnswer, multipleChoiceIndicesCorrect, propositionLabels } from "@/lib/proposition-labels";
import { Question } from "@/types";
import { useState } from "react";
import { Card } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { CheckCircle2, Loader2, Pencil, Save, Trash2 } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";

export function QuestionCard({
    question,
    index,
    updateQuestion,
    deleteQuestion,
    onQuestionUpdated,
    onQuestionDeleted,
}: {
    question: Question;
    index: number;
    updateQuestion:(
        questionId: string,
        updates: {
          type?: "single" | "multiple" | "open";
          question?: string;
          proposals?: Question["proposals"];
          correctAnswer?: string | null;
          correctAnswers?: string[] | null;
          explanation?: string | null;
        }
      ) => Promise<Question | null>;
    deleteQuestion: (questionId: string) => Promise<boolean>;
    onQuestionUpdated: (updatedQuestion: Question) => void;
    onQuestionDeleted: (questionId: string) => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editedType, setEditedType] = useState<"single" | "multiple" | "open">(question.type === "multiple" ? "single" : question.type as "single" | "multiple" | "open");
    const [editedQuestion, setEditedQuestion] = useState(question.question);
    const initialLabels = propositionLabels(question.proposals);
    const [editedPropositions, setEditedPropositions] = useState<string[]>(
        initialLabels.length > 0
            ? initialLabels
            : ["Option A", "Option B", "Option C", "Option D"],
    );
    const rawCorrectIdx = initialLabels.findIndex((_, i) =>
        indexMatchesCorrectAnswer(i, question.proposals, question.correctAnswer),
    );
    const initialCorrectIndex = rawCorrectIdx >= 0 ? rawCorrectIdx : 0;
    const [correctAnswerIndex, setCorrectAnswerIndex] = useState(initialCorrectIndex);
    const initialCorrectIndices = multipleChoiceIndicesCorrect(
        question.proposals,
        question.correctAnswers,
    );
    const [correctAnswerIndices, setCorrectAnswerIndices] = useState<number[]>(
        initialCorrectIndices,
    );
    const [editedBonneReponse, setEditedBonneReponse] = useState(
        correctAnswerDisplay(question.proposals, question.correctAnswer) || "",
    );
    const [editedExplication, setEditedExplication] = useState(
        question.explanation || "",
    );
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const handleTypeChange = (newType: "single" | "open") => {
        setEditedType(newType);
        if (newType === "single" && editedPropositions.length === 0) {
            setEditedPropositions(["Option A", "Option B", "Option C", "Option D"]);
            setCorrectAnswerIndex(0);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);

        let goodAnswer: string | null = null;
        let goodAnswers: string[] | null = null;
        let propositions: string[] | null = null;

        if (editedType === "single") {
            propositions = editedPropositions;
            if (correctAnswerIndex >= 0 && correctAnswerIndex < editedPropositions.length) {
                goodAnswer = editedPropositions[correctAnswerIndex];
            }
        } else {
            goodAnswer = editedBonneReponse || null;
        }

        const updates = {
            type: editedType,
            question: editedQuestion,
            correctAnswer: goodAnswer,
            correctAnswers: goodAnswers,
            explanation: editedExplication || null,
            propositions: propositions,
        };

        const result = await updateQuestion(question.id, updates);
        if (result) {
            onQuestionUpdated(result);
            setIsEditing(false);
        }
        setIsSaving(false);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        const success = await deleteQuestion(question.id);
        if (success) {
            onQuestionDeleted(question.id);
        }
        setIsDeleting(false);
        setDeleteConfirmOpen(false);
    };

    const handleCancel = () => {
        setEditedType(question.type === "multiple" ? "single" : question.type as "single" | "open");
        setEditedQuestion(question.question);
        const labels = propositionLabels(question.proposals);
        setEditedPropositions(
            labels.length > 0
                ? labels
                : ["Option A", "Option B", "Option C", "Option D"],
        );
        const resetIdx = labels.findIndex((_, i) =>
            indexMatchesCorrectAnswer(i, question.proposals, question.correctAnswer),
        );
        setCorrectAnswerIndex(resetIdx >= 0 ? resetIdx : 0);
        setCorrectAnswerIndices(
            multipleChoiceIndicesCorrect(
                question.proposals,
                question.correctAnswers,
            ),
        );
        setEditedBonneReponse(
            correctAnswerDisplay(question.proposals, question.correctAnswer) || "",
        );
        setEditedExplication(question.explanation || "");
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <>
                <Card className="p-3 bg-muted/30 border-primary/20" data-testid={`card-question-edit-${question.id}`}>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                    {index + 1}
                                </div>
                                <Select value={editedType} onValueChange={(v) => handleTypeChange(v as "single" | "open")}>
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
                                {editedPropositions.map((prop, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="font-medium text-xs w-4">{String.fromCharCode(65 + i)}.</span>
                                        <Input
                                            value={prop}
                                            onChange={(e) => {
                                                const newProps = [...editedPropositions];
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
                                    value={editedBonneReponse}
                                    onChange={(e) => setEditedBonneReponse(e.target.value)}
                                    placeholder="Réponse attendue..."
                                    className="min-h-[40px] text-sm"
                                    data-testid={`input-answer-${question.id}`}
                                />
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Explication (optionnelle)</label>
                            <Textarea
                                value={editedExplication}
                                onChange={(e) => setEditedExplication(e.target.value)}
                                placeholder="Explication de la réponse..."
                                className="min-h-[40px] text-sm"
                                data-testid={`input-explanation-${question.id}`}
                            />
                        </div>
                    </div>
                </Card>

                <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer cette question ?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Cette action est irréversible. La question sera définitivement supprimée.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Supprimer
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </>
        );
    }

    return (
        <Card className="p-3 bg-muted/30 group" data-testid={`card-question-${question.id}`}>
            <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                    {index + 1}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${question.type === 'single' || question.type === 'multiple'
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                            }`}>
                            {question.type === 'single' || question.type === 'multiple' ? 'QCM' : 'Ouverte'}
                        </span>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setIsEditing(true)}
                            data-testid={`button-edit-question-${question.id}`}
                        >
                            <Pencil className="h-3 w-3" />
                        </Button>
                    </div>
                    <p className="text-sm">{question.question}</p>
                    {(question.type === 'single' || question.type === 'multiple') && propositionLabels(question.proposals).length > 0 && (
                        <ul className="text-xs space-y-0.5">
                            {propositionLabels(question.proposals).map((prop, i) => (
                                <li key={i} className={`flex items-center gap-1 ${indexMatchesCorrectAnswer(i, question.proposals, question.correctAnswer) ? 'text-green-600 dark:text-green-400 font-medium' : 'text-muted-foreground'
                                    }`}>
                                    <span>{String.fromCharCode(65 + i)}.</span>
                                    <span>{prop}</span>
                                    {indexMatchesCorrectAnswer(i, question.proposals, question.correctAnswer) && <CheckCircle2 className="h-3 w-3" />}
                                </li>
                            ))}
                        </ul>
                    )}
                    {question.type === 'open' && question.correctAnswer && (
                        <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Réponse:</span>{" "}
                            {correctAnswerDisplay(question.proposals, question.correctAnswer)}
                        </p>
                    )}
                </div>
            </div>
        </Card>
    );
}