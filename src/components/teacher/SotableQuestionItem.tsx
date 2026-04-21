import { Question } from "@/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { QuestionCard } from "./QuestionCard";


interface SortableQuestionItemProps {
    question: Question;
    index: number;
    updateQuestion: (
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
}

export function SortableQuestionItem({
    question,
    index,
    updateQuestion,
    deleteQuestion,
    onQuestionUpdated,
    onQuestionDeleted,
}: SortableQuestionItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: question.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-start gap-2">
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 mt-2 text-muted-foreground hover:text-foreground"
                data-testid={`drag-handle-question-${question.id}`}
            >
                <GripVertical className="h-4 w-4" />
            </div>
            <div className="flex-1">
                <QuestionCard
                    question={question}
                    index={index}
                    updateQuestion={updateQuestion}
                    deleteQuestion={deleteQuestion}
                    onQuestionUpdated={onQuestionUpdated}
                    onQuestionDeleted={onQuestionDeleted}
                />
            </div>
        </div>
    );
}