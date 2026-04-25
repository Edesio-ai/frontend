import { correctAnswerDisplay, indexMatchesCorrectAnswer, multipleChoiceIndicesCorrect, propositionLabels } from "@/lib/proposition-labels";
import { Question, UpdateQuestionRequest } from "@/types";
import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { CheckCircle2, Pencil } from "lucide-react";
import { EditQuestionModal } from "./EditQuestionModal";

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
    updateQuestion: (
        questionId: string,
        updates: UpdateQuestionRequest
    ) => Promise<Question | null>;
    deleteQuestion: (questionId: string) => Promise<boolean>;
    onQuestionUpdated: (updatedQuestion: Question) => void;
    onQuestionDeleted: (questionId: string) => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editedType, setEditedType] = useState<"single" | "multiple" | "open">(question.type === "multiple" ? "single" : question.type as "single" | "multiple" | "open");
    const [editedQuestion, setEditedQuestion] = useState(question.questionText);
    const initialLabels = propositionLabels(question.proposals);
    const [editedProposals, setEditedPropositions] = useState<string[]>(
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
    const [editedGoodAnswer, setEditedGoodAnswer] = useState(
        correctAnswerDisplay(question.proposals, question.correctAnswers) || "",
    );
    const [editedExplanation, setEditedExplication] = useState(
        question.explanation || "",
    );
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const handleTypeChange = (newType: "single" | "open") => {
        setEditedType(newType);
        if (newType === "single" && editedProposals.length === 0) {
            setEditedPropositions(["Option A", "Option B", "Option C", "Option D"]);
            setCorrectAnswerIndex(0);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);

        let correctAnswers: string[] = [];
        let proposals: string[] | null = null;
        if (editedType === "single") {
            proposals = editedProposals;
            if (correctAnswerIndex >= 0 && correctAnswerIndex < editedProposals.length) {
                correctAnswers.push(editedProposals[correctAnswerIndex]);
            }
        } else {
            correctAnswers.push(editedGoodAnswer);
        }

        const updates: UpdateQuestionRequest = {
            type: editedType,
            questionText: editedQuestion,
            explanation: editedExplanation || null,
            correctAnswers,
            proposals: proposals || [],
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
        setEditedQuestion(question.questionText);
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
        setEditedGoodAnswer(
            correctAnswerDisplay(question.proposals, question.correctAnswers) || "",
        );
        setEditedExplication(question.explanation || "");
        setIsEditing(false);
    };

    if (isEditing) {
        return <EditQuestionModal
            question={question}
            index={index}
            editedType={editedType}
            editedProposals={editedProposals}
            setEditedPropositions={setEditedPropositions}
            handleTypeChange={handleTypeChange}
            setDeleteConfirmOpen={setDeleteConfirmOpen}
            isSaving={isSaving}
            handleCancel={handleCancel}
            handleSave={handleSave}
            editedQuestion={editedQuestion}
            setEditedQuestion={setEditedQuestion}
            correctAnswerIndex={correctAnswerIndex}
            setCorrectAnswerIndex={setCorrectAnswerIndex}
            editedGoodAnswer={editedGoodAnswer}
            setEditedGoodAnswer={setEditedGoodAnswer}
            editedExplanation={editedExplanation}
            setEditedExplication={setEditedExplication}
            deleteConfirmOpen={deleteConfirmOpen}
            isDeleting={isDeleting}
            handleDelete={handleDelete}
        />
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
                    <p className="text-sm">{question.questionText}</p>
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
                            {correctAnswerDisplay(question.proposals, question.correctAnswers)}
                        </p>
                    )}
                </div>
            </div>
        </Card>
    );
}