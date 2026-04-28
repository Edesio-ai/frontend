import { Loader2, Sparkles } from "lucide-react";
import { Input } from "../ui/input";
import { MAX_QUESTIONS } from "@/utils/constants/teacher";
import { Button } from "../ui/button";

interface QuestionGeneratorProps {
    genMultipleChoiceCount: number;
    genOpenedCount: number;
    handleConfigChange: (field: 'single' | 'open', value: number) => void;
    executeGeneration: () => Promise<void>;
    isGenerating: boolean;
    genTotalQuestions: number;
    generateError: string | null;
    generateSuccess: string | null;
}

export function QuestionGenerator({
    genMultipleChoiceCount,
    genOpenedCount,
    handleConfigChange,
    executeGeneration,
    isGenerating,
    genTotalQuestions,
    generateError,
    generateSuccess,
}: QuestionGeneratorProps) {
    return (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <h5 className="font-medium flex flex-wrap items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Générer les questions
            </h5>

            <p className="text-sm text-muted-foreground">
                L'IA va analyser le contenu du cours et les PDFs pour créer des questions.
            </p>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Questions QCM</label>
                    <Input
                        type="number"
                        min={0}
                        max={MAX_QUESTIONS}
                        value={genMultipleChoiceCount}
                        onChange={(e) => handleConfigChange('single', parseInt(e.target.value) || 0)}
                        data-testid="input-qcm-count"
                    />
                </div>
                <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Questions ouvertes</label>
                    <Input
                        type="number"
                        min={0}
                        max={MAX_QUESTIONS}
                        value={genOpenedCount}
                        onChange={(e) => handleConfigChange('open', parseInt(e.target.value) || 0)}
                        data-testid="input-ouverte-count"
                    />
                </div>
            </div>

            <p className="text-xs text-muted-foreground">
                Total: {genTotalQuestions} questions (max {MAX_QUESTIONS})
            </p>

            <Button
                onClick={executeGeneration}
                disabled={isGenerating || genTotalQuestions === 0}
                className="w-full"
                size="lg"
                data-testid="button-generate-questions"
            >
                {isGenerating ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Génération en cours...</>
                ) : (
                    <><Sparkles className="h-4 w-4 mr-2" /> Générer {genTotalQuestions} questions</>
                )}
            </Button>

            {generateError && (
                <p className="text-sm text-destructive">{generateError}</p>
            )}
            {generateSuccess && (
                <p className="text-sm text-green-600">{generateSuccess}</p>
            )}
        </div>
    )
}