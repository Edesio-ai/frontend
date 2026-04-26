import { getCookie } from "@/lib/cookies";
import { Question } from "@/types/course.type";

export const exportService = {
    exportQuestionsPdf: async (questions: Question[], courseTitle: string, sessionName: string): Promise<void> => {
        const csrfToken = getCookie("csrf_token");
        const response = await fetch(`/api/export/questions`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
            },
            body: JSON.stringify({ questions, courseTitle, sessionName }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error?.message ?? "Export échoué");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const contentDisposition = response.headers.get("content-disposition") ?? "";
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        a.download = match?.[1] ?? `questions_${courseTitle.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
    },
};