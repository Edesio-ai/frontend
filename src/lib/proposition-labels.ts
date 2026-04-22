import type { Question } from "@/types";

/** Libellés affichables pour le JSON `proposals` (tableau de chaînes ou `{ id, label }[]`). */
export function propositionLabels(proposals: unknown): string[] {
  if (proposals == null || !Array.isArray(proposals)) return [];
  return proposals
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
  proposals: unknown,
  correctAnswers: string[] | null,
): string {

  if (correctAnswers == null) return "";

  if (!Array.isArray(proposals) || proposals.length === 0) {
    return correctAnswers.join(", ");
  }
  const first = proposals[0];
  if (typeof first === "object" && first !== null && "id" in first) {
    const row = proposals.find(
      (p): p is { id: string; label: string } =>
        typeof p === "object" &&
        p !== null &&
        "id" in p &&
        (p as { id: string }).id === correctAnswers[0],
    );
    if (row?.label) return row.label;
  }
  const labels = propositionLabels(proposals);
  if (labels.includes(correctAnswers[0])) return correctAnswers[0];
  return correctAnswers.join(", ");
}

export function multipleChoiceIndicesCorrect(
  proposals: unknown,
  correctAnswers: string[] | null,
): number[] {
  if (
    !correctAnswers?.length ||
    proposals == null ||
    !Array.isArray(proposals) ||
    proposals.length === 0
  ) {
    return [];
  }
  const first = proposals[0];
  if (typeof first === "object" && first !== null && "id" in first) {
    const out: number[] = [];
    proposals.forEach((p, i) => {
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
  const labels = propositionLabels(proposals);
  return labels
    .map((label, i) => (correctAnswers.includes(label) ? i : -1))
    .filter((i) => i >= 0);
}

export function indexMatchesCorrectAnswer(
  index: number,
  proposals: unknown,
  correctAnswer: string | null,
): boolean {
  if (correctAnswer == null || !Array.isArray(proposals)) return false;
  if (index < 0 || index >= proposals.length) return false;
  const item = proposals[index];
  if (typeof item === "object" && item !== null && "id" in item) {
    return (item as { id: string }).id === correctAnswer;
  }
  const labels = propositionLabels(proposals);
  return labels[index] === correctAnswer;
}

export function letterAnswerIsCorrect(question: Question, answerIndex: number): boolean {
  if (answerIndex < 0) return false;
  if (question.type === "multiple" && question.correctAnswers?.length) {
    const labels = propositionLabels(question.proposals);
    const label = labels[answerIndex];
    if (label && question.correctAnswers.includes(label)) return true;
    const item = Array.isArray(question.proposals)
      ? question.proposals[answerIndex]
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
    question.proposals,
    question.correctAnswer,
  );
}
