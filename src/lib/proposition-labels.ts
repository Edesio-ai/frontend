import type { Question } from "@/types";

/** Libellés affichables pour le JSON `propositions` (tableau de chaînes ou `{ id, label }[]`). */
export function propositionLabels(propositions: unknown): string[] {
  if (propositions == null || !Array.isArray(propositions)) return [];
  return propositions
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "label" in item) {
        return String((item as { label?: unknown }).label ?? "");
      }
      return "";
    })
    .filter((s) => s.length > 0);
}

export function correctAnswerDisplay(
  propositions: unknown,
  correctAnswer: string | null,
): string {
  if (correctAnswer == null) return "";
  if (!Array.isArray(propositions) || propositions.length === 0) {
    return correctAnswer;
  }
  const first = propositions[0];
  if (typeof first === "object" && first !== null && "id" in first) {
    const row = propositions.find(
      (p): p is { id: string; label: string } =>
        typeof p === "object" &&
        p !== null &&
        "id" in p &&
        (p as { id: string }).id === correctAnswer,
    );
    if (row?.label) return row.label;
  }
  const labels = propositionLabels(propositions);
  if (labels.includes(correctAnswer)) return correctAnswer;
  return correctAnswer;
}

export function multipleChoiceIndicesCorrect(
  propositions: unknown,
  correctAnswers: string[] | null,
): number[] {
  if (
    !correctAnswers?.length ||
    propositions == null ||
    !Array.isArray(propositions) ||
    propositions.length === 0
  ) {
    return [];
  }
  const first = propositions[0];
  if (typeof first === "object" && first !== null && "id" in first) {
    const out: number[] = [];
    propositions.forEach((p, i) => {
      if (
        typeof p === "object" &&
        p !== null &&
        "id" in p &&
        correctAnswers.includes((p as { id: string }).id)
      ) {
        out.push(i);
      }
    });
    return out;
  }
  const labels = propositionLabels(propositions);
  return labels
    .map((label, i) => (correctAnswers.includes(label) ? i : -1))
    .filter((i) => i >= 0);
}

export function indexMatchesCorrectAnswer(
  index: number,
  propositions: unknown,
  correctAnswer: string | null,
): boolean {
  if (correctAnswer == null || !Array.isArray(propositions)) return false;
  if (index < 0 || index >= propositions.length) return false;
  const item = propositions[index];
  if (typeof item === "object" && item !== null && "id" in item) {
    return (item as { id: string }).id === correctAnswer;
  }
  const labels = propositionLabels(propositions);
  return labels[index] === correctAnswer;
}

export function letterAnswerIsCorrect(question: Question, answerIndex: number): boolean {
  if (answerIndex < 0) return false;
  if (question.type === "multiple" && question.correctAnswers?.length) {
    const labels = propositionLabels(question.propositions);
    const label = labels[answerIndex];
    if (label && question.correctAnswers.includes(label)) return true;
    const item = Array.isArray(question.propositions)
      ? question.propositions[answerIndex]
      : undefined;
    if (
      item &&
      typeof item === "object" &&
      "id" in item &&
      question.correctAnswers.includes((item as { id: string }).id)
    ) {
      return true;
    }
    return false;
  }
  return indexMatchesCorrectAnswer(
    answerIndex,
    question.propositions,
    question.correctAnswer,
  );
}
